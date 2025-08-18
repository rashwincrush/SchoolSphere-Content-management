import {
  users,
  branches,
  events,
  eventRsvps,
  posts,
  notifications,
  activityLogs,
  organizations,
  type User,
  type UpsertUser,
  type Branch,
  type InsertBranch,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type InsertEventRsvp,
  type Post,
  type InsertPost,
  type Notification,
  type InsertNotification,
  type ActivityLog,
  type InsertActivityLog,
  type Organization,
  type InsertOrganization,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;
  
  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByUserId(userId: string): Promise<Organization | undefined>;
  updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization>;
  
  // Branch operations
  getBranches(organizationId: number): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, updates: Partial<Branch>): Promise<Branch>;
  deleteBranch(id: number): Promise<void>;
  
  // Event operations
  getEvents(organizationId: number, branchId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // RSVP operations
  createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  getRsvpsForEvent(eventId: number): Promise<EventRsvp[]>;
  getUserRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined>;
  updateRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp>;
  
  // Post operations
  getPosts(organizationId: number, branchId?: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
  // Activity log operations
  getActivityLogs(organizationId: number, branchId?: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Settings operations
  getSettings(organizationId: number): Promise<any>;
  updateSettings(organizationId: number, settings: any): Promise<any>;
  
  // Analytics operations
  getEventStats(organizationId: number, branchId?: number): Promise<any>;
  getSocialStats(organizationId: number, branchId?: number): Promise<any>;
  getUserStats(organizationId: number, branchId?: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationByUserId(userId: string): Promise<Organization | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.organizationId) return undefined;
    return this.getOrganization(user.organizationId);
  }

  async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization> {
    const [org] = await db
      .update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  // Branch operations
  async getBranches(organizationId: number): Promise<Branch[]> {
    return await db
      .select()
      .from(branches)
      .where(eq(branches.organizationId, organizationId))
      .orderBy(branches.name);
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values(branchData).returning();
    return branch;
  }

  async updateBranch(id: number, updates: Partial<Branch>): Promise<Branch> {
    const [branch] = await db
      .update(branches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return branch;
  }

  async deleteBranch(id: number): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }

  // Event operations
  async getEvents(organizationId: number, branchId?: number): Promise<Event[]> {
    if (branchId) {
      return await db
        .select()
        .from(events)
        .where(and(eq(events.organizationId, organizationId), eq(events.branchId, branchId)))
        .orderBy(desc(events.startDate));
    }
    
    return await db
      .select()
      .from(events)
      .where(eq(events.organizationId, organizationId))
      .orderBy(desc(events.startDate));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // RSVP operations
  async createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const [newRsvp] = await db.insert(eventRsvps).values(rsvp).returning();
    return newRsvp;
  }

  async getRsvpsForEvent(eventId: number): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId));
  }

  async getUserRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined> {
    const [rsvp] = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
    return rsvp;
  }

  async updateRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp> {
    const [rsvp] = await db
      .update(eventRsvps)
      .set({ status: status as any })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .returning();
    return rsvp;
  }

  // Post operations
  async getPosts(organizationId: number, branchId?: number): Promise<Post[]> {
    if (branchId) {
      return await db
        .select()
        .from(posts)
        .where(and(eq(posts.organizationId, organizationId), eq(posts.branchId, branchId)))
        .orderBy(desc(posts.createdAt));
    }
    
    return await db
      .select()
      .from(posts)
      .where(eq(posts.organizationId, organizationId))
      .orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Activity log operations
  async getActivityLogs(organizationId: number, branchId?: number, limit: number = 50): Promise<ActivityLog[]> {
    let query = db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.organizationId, organizationId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    if (branchId) {
      query = db
        .select()
        .from(activityLogs)
        .where(and(eq(activityLogs.organizationId, organizationId), eq(activityLogs.branchId, branchId)))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }

    return await query;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Settings operations
  async getSettings(organizationId: number): Promise<any> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    return org?.settings || {};
  }

  async updateSettings(organizationId: number, settings: any): Promise<any> {
    const [org] = await db
      .update(organizations)
      .set({ settings, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId))
      .returning();
    return org?.settings || {};
  }

  // Analytics operations
  async getEventStats(organizationId: number, branchId?: number): Promise<any> {
    const baseCondition = eq(events.organizationId, organizationId);
    const condition = branchId ? and(baseCondition, eq(events.branchId, branchId)) : baseCondition;

    const [totalEvents] = await db
      .select({ count: count() })
      .from(events)
      .where(condition);

    const [upcomingEvents] = await db
      .select({ count: count() })
      .from(events)
      .where(and(condition, sql`start_date > NOW()`));

    return {
      total: totalEvents.count,
      upcoming: upcomingEvents.count,
      completed: totalEvents.count - upcomingEvents.count,
    };
  }

  async getSocialStats(organizationId: number, branchId?: number): Promise<any> {
    const baseCondition = eq(posts.organizationId, organizationId);
    const condition = branchId ? and(baseCondition, eq(posts.branchId, branchId)) : baseCondition;

    const [totalPosts] = await db
      .select({ count: count() })
      .from(posts)
      .where(condition);

    const [recentPosts] = await db
      .select({ count: count() })
      .from(posts)
      .where(and(condition, sql`created_at > NOW() - INTERVAL '7 days'`));

    return {
      totalPosts: totalPosts.count,
      recentPosts: recentPosts.count,
      engagement: Math.floor(Math.random() * 100),
    };
  }

  async getUserStats(organizationId: number, branchId?: number): Promise<any> {
    const baseCondition = eq(users.organizationId, organizationId);
    const condition = branchId ? and(baseCondition, eq(users.branchId, branchId)) : baseCondition;

    const [totalUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(condition);

    const [activeUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(and(condition, eq(users.isActive, true)));

    return {
      total: totalUsers.count,
      active: activeUsers.count,
      inactive: totalUsers.count - activeUsers.count,
    };
  }
}

export const storage = new DatabaseStorage();
