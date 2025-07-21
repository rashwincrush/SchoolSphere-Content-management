import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
  uuid,
  date,
  time,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Organizations/Tenants table (Multi-tenant support)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }),
  logo: varchar("logo", { length: 500 }),
  settings: jsonb("settings").$type<Record<string, any>>().default({}),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStatus: varchar("subscription_status", { 
    enum: ["trial", "active", "past_due", "canceled", "unpaid"] 
  }).default("trial"),
  subscriptionPlan: varchar("subscription_plan", { 
    enum: ["starter", "professional", "enterprise"] 
  }).default("starter"),
  trialEndsAt: timestamp("trial_ends_at"),
  billingEmail: varchar("billing_email", { length: 255 }),
  maxBranches: integer("max_branches").default(1),
  maxUsers: integer("max_users").default(50),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User storage table (required for Replit Auth + Multi-tenant)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  organizationId: integer("organization_id").references(() => organizations.id),
  role: varchar("role", { enum: ["owner", "admin", "teacher", "parent", "student"] }).default("parent"),
  branchId: integer("branch_id").references(() => branches.id),
  language: varchar("language", { enum: ["en", "es"] }).default("en"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Branches table
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  startTime: time("start_time").notNull(),
  endDate: date("end_date"),
  endTime: time("end_time"),
  location: varchar("location", { length: 255 }),
  category: varchar("category", { enum: ["academic", "sports", "cultural", "other"] }).default("other"),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  maxAttendees: integer("max_attendees"),
  requiresRsvp: boolean("requires_rsvp").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs table
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: varchar("status", { enum: ["attending", "not_attending", "maybe"] }).default("attending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content/Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { enum: ["announcement", "news", "social"] }).default("announcement"),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  isPublished: boolean("is_published").default(false),
  socialPlatforms: jsonb("social_platforms").$type<string[]>().default([]),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["event", "announcement", "system", "emergency", "billing"] }).default("system"),
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"), // Can reference events, posts, etc.
  relatedType: varchar("related_type", { enum: ["event", "post", "user", "subscription"] }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  branchId: integer("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  interval: varchar("interval", { enum: ["month", "year"] }).default("month"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  features: jsonb("features").$type<string[]>().default([]),
  maxBranches: integer("max_branches").default(1),
  maxUsers: integer("max_users").default(50),
  maxStorageGB: integer("max_storage_gb").default(10),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription history table
export const subscriptionHistory = pgTable("subscription_history", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { enum: ["active", "canceled", "past_due", "unpaid", "incomplete"] }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  canceledAt: timestamp("canceled_at"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Usage tracking table
export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  activeUsers: integer("active_users").default(0),
  totalEvents: integer("total_events").default(0),
  totalPosts: integer("total_posts").default(0),
  storageUsedMB: integer("storage_used_mb").default(0),
  apiCalls: integer("api_calls").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  branches: many(branches),
  events: many(events),
  posts: many(posts),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
  subscriptionHistory: many(subscriptionHistory),
  usageTracking: many(usageTracking),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  createdEvents: many(events),
  createdPosts: many(posts),
  rsvps: many(eventRsvps),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  events: many(events),
  posts: many(posts),
  activityLogs: many(activityLogs),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  branch: one(branches, {
    fields: [events.branchId],
    references: [branches.id],
  }),
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  branch: one(branches, {
    fields: [posts.branchId],
    references: [branches.id],
  }),
  creator: one(users, {
    fields: [posts.createdBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [activityLogs.branchId],
    references: [branches.id],
  }),
}));

// Schema types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

// Zod schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
