import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertPostSchema, insertRsvpSchema, insertBranchSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to get user's organization
async function getUserOrganization(userId: string) {
  const user = await storage.getUser(userId);
  if (!user?.organizationId) {
    throw new Error('User not associated with organization');
  }
  return user.organizationId;
}

// Profile update schema
const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  language: z.enum(['en', 'es']).optional(),
});

// Organization update schema
const organizationUpdateSchema = z.object({
  name: z.string().optional(),
  domain: z.string().optional(),
  billingEmail: z.string().email().optional(),
});

// Settings schema
const settingsSchema = z.object({
  defaultLanguage: z.enum(['en', 'es']).optional(),
  timezone: z.string().optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  enableNotifications: z.boolean().optional(),
  enableEmailNotifications: z.boolean().optional(),
  enableSocialMediaIntegration: z.boolean().optional(),
  autoPostToSocial: z.boolean().optional(),
  requireEventApproval: z.boolean().optional(),
  maxEventsPerMonth: z.number().min(1).max(1000).optional(),
  maxPostsPerDay: z.number().min(1).max(50).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = profileUpdateSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Organization routes
  app.get('/api/organization', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organization = await storage.getOrganizationByUserId(userId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.patch('/api/organization', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is owner or admin
      if (!['owner', 'admin'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const organizationId = await getUserOrganization(userId);
      const updates = organizationUpdateSchema.parse(req.body);
      const organization = await storage.updateOrganization(organizationId, updates);
      res.json(organization);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ message: "Failed to update organization" });
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      const settings = await storage.getSettings(organizationId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is owner or admin
      if (!['owner', 'admin'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const organizationId = await getUserOrganization(userId);
      const settings = settingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSettings(organizationId, settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Branch routes
  app.get('/api/branches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      const branches = await storage.getBranches(organizationId);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.get('/api/branches/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const branch = await storage.getBranch(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      // Check if branch belongs to user's organization
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      if (branch.organizationId !== organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(branch);
    } catch (error) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ message: "Failed to fetch branch" });
    }
  });

  app.post('/api/branches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is owner or admin
      if (!['owner', 'admin'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const organizationId = await getUserOrganization(userId);
      const branchData = insertBranchSchema.parse({
        ...req.body,
        organizationId,
      });
      
      const branch = await storage.createBranch(branchData);
      res.status(201).json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  app.patch('/api/branches/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is owner or admin
      if (!['owner', 'admin'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      const branch = await storage.updateBranch(id, updates);
      res.json(branch);
    } catch (error) {
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "Failed to update branch" });
    }
  });

  app.delete('/api/branches/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is owner or admin
      if (!['owner', 'admin'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteBranch(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting branch:", error);
      res.status(500).json({ message: "Failed to delete branch" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const events = await storage.getEvents(organizationId, branchId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if event belongs to user's organization
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      if (event.organizationId !== organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizationId,
        createdBy: userId,
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const event = await storage.updateEvent(id, updates);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // RSVP routes
  app.post('/api/events/:eventId/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = req.user.claims.sub;
      
      const rsvpData = insertRsvpSchema.parse({
        eventId,
        userId,
        status: req.body.status || 'attending',
      });
      
      const existingRsvp = await storage.getUserRsvp(eventId, userId);
      
      let rsvp;
      if (existingRsvp) {
        rsvp = await storage.updateRsvp(eventId, userId, rsvpData.status);
      } else {
        rsvp = await storage.createRsvp(rsvpData);
      }
      
      res.json(rsvp);
    } catch (error) {
      console.error("Error creating/updating RSVP:", error);
      res.status(500).json({ message: "Failed to RSVP to event" });
    }
  });

  app.get('/api/events/:eventId/rsvps', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const rsvps = await storage.getRsvpsForEvent(eventId);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch RSVPs" });
    }
  });

  // Post routes
  app.get('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const posts = await storage.getPosts(organizationId, branchId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if post belongs to user's organization
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      if (post.organizationId !== organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      
      const postData = insertPostSchema.parse({
        ...req.body,
        organizationId,
        authorId: userId,
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.patch('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const post = await storage.updatePost(id, updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      
      const [eventStats, socialStats, userStats] = await Promise.all([
        storage.getEventStats(organizationId, branchId),
        storage.getSocialStats(organizationId, branchId),
        storage.getUserStats(organizationId, branchId),
      ]);
      
      res.json({
        events: eventStats,
        social: socialStats,
        users: userStats,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Activity log routes
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationId = await getUserOrganization(userId);
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const activities = await storage.getActivityLogs(organizationId, branchId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}