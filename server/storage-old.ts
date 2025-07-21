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

  // Branch operations
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).where(eq(branches.isActive, true));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db.insert(branches).values(branch).returning();
    return newBranch;
  }

  // Event operations
  async getEvents(branchId?: number): Promise<Event[]> {
    const query = db.select().from(events).where(eq(events.isActive, true));
    
    if (branchId) {
      return await query.where(and(eq(events.isActive, true), eq(events.branchId, branchId)));
    }
    
    return await query.orderBy(desc(events.startDate));
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
    await db.update(events).set({ isActive: false }).where(eq(events.id, id));
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
    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set({ status })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .returning();
    return updatedRsvp;
  }

  // Post operations
  async getPosts(branchId?: number): Promise<Post[]> {
    const query = db.select().from(posts);
    
    if (branchId) {
      return await query.where(eq(posts.branchId, branchId)).orderBy(desc(posts.createdAt));
    }
    
    return await query.orderBy(desc(posts.createdAt));
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
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Activity log operations
  async getActivityLogs(branchId?: number, limit = 50): Promise<ActivityLog[]> {
    const query = db.select().from(activityLogs);
    
    if (branchId) {
      return await query
        .where(eq(activityLogs.branchId, branchId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }
    
    return await query.orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Analytics operations
  async getEventStats(branchId?: number): Promise<any> {
    const eventCountQuery = db
      .select({ count: count() })
      .from(events)
      .where(eq(events.isActive, true));
    
    if (branchId) {
      eventCountQuery.where(and(eq(events.isActive, true), eq(events.branchId, branchId)));
    }
    
    const [eventCount] = await eventCountQuery;
    
    return {
      totalEvents: eventCount.count,
      // Add more analytics as needed
    };
  }

  async getSocialStats(branchId?: number): Promise<any> {
    const postCountQuery = db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.isPublished, true));
    
    if (branchId) {
      postCountQuery.where(and(eq(posts.isPublished, true), eq(posts.branchId, branchId)));
    }
    
    const [postCount] = await postCountQuery;
    
    return {
      totalPosts: postCount.count,
      // Add more analytics as needed
    };
  }

  async getUserStats(branchId?: number): Promise<any> {
    const userCountQuery = db.select({ count: count() }).from(users);
    
    if (branchId) {
      userCountQuery.where(eq(users.branchId, branchId));
    }
    
    const [userCount] = await userCountQuery;
    
    return {
      totalUsers: userCount.count,
      // Add more analytics as needed
    };
  }
}

export const storage = new DatabaseStorage();
