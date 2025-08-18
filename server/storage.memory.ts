import type { IStorage } from './storage';
import {
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
} from "@shared/schema";

// Simple in-memory auto-increment helpers
let postId = 1;
let eventId = 1;
let rsvpId = 1;
let notificationId = 1;
let activityId = 1;
let branchId = 1;
let orgId = 1;

// Seed data
const organizations: Organization[] = [
  {
    id: orgId,
    name: 'Demo School',
    slug: 'demo-school',
    domain: 'localhost',
    logo: undefined,
    settings: { defaultLanguage: 'en', timezone: 'UTC' },
    stripeCustomerId: null as any,
    stripeSubscriptionId: null as any,
    subscriptionStatus: 'active' as any,
    subscriptionPlan: 'starter' as any,
    trialEndsAt: null as any,
    billingEmail: 'admin@demo.school',
    maxBranches: 5,
    maxUsers: 500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const usersById = new Map<string, User>();

function seedUser(id: string, email: string, role: User['role'], firstName: string, lastName: string) {
  const u: User = {
    id,
    email,
    firstName,
    lastName,
    profileImageUrl: '',
    organizationId: orgId,
    role,
    branchId: undefined as any,
    language: 'en' as any,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  usersById.set(id, u);
  return u;
}

// Default dev users
seedUser('demo-admin', 'admin@demo.school', 'owner', 'Demo', 'Admin');
seedUser('demo-teacher', 'teacher@demo.school', 'teacher', 'Taylor', 'Teach');

const branchesArr: Branch[] = [
  {
    id: branchId++,
    organizationId: orgId,
    name: 'Main Campus',
    address: '123 Demo St',
    phone: '555-0100',
    email: 'main@demo.school',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const eventsArr: Event[] = [];
const rsvpsArr: EventRsvp[] = [];
const postsArr: Post[] = [];
const notificationsArr: Notification[] = [];
const activityArr: ActivityLog[] = [];

export const memoryStorage: IStorage = {
  async getUser(id) {
    return usersById.get(id);
  },
  async upsertUser(userData: UpsertUser) {
    const existing = userData.id ? usersById.get(userData.id) : undefined;
    const now = new Date();
    if (existing) {
      const updated: User = { ...existing, ...userData, updatedAt: now } as User;
      usersById.set(updated.id, updated);
      return updated;
    }
    const id = userData.id || `user-${usersById.size + 1}`;
    const created: User = {
      id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl as any,
      organizationId: userData.organizationId ?? orgId,
      role: (userData as any).role || 'parent',
      branchId: (userData as any).branchId,
      language: (userData as any).language || 'en',
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };
    usersById.set(id, created);
    return created;
  },
  async updateUserProfile(id, updates) {
    const existing = usersById.get(id)!;
    const updated: User = { ...existing, ...updates, updatedAt: new Date() } as User;
    usersById.set(id, updated);
    return updated;
  },

  // Additional user operations for user management (dev mode)
  async getUsers(organizationId, branchIdFilter) {
    const list = Array.from(usersById.values()).filter(
      (u) => u.organizationId === organizationId && (!branchIdFilter || u.branchId === branchIdFilter)
    );
    return list.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
  },
  async createUser(userData) {
    const id = userData.id || `user-${usersById.size + 1}`;
    const now = new Date();
    const created: User = {
      id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: (userData as any).profileImageUrl as any,
      organizationId: userData.organizationId ?? orgId,
      role: (userData as any).role || 'parent',
      branchId: (userData as any).branchId,
      language: (userData as any).language || 'en',
      isActive: (userData as any).isActive ?? true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    } as User;
    usersById.set(id, created);
    return created;
  },
  async updateUser(id, updates) {
    const existing = usersById.get(id)!;
    const updated: User = { ...existing, ...updates, updatedAt: new Date() } as User;
    usersById.set(id, updated);
    return updated;
  },
  async deleteUser(id) {
    usersById.delete(id);
  },

  async getOrganization(id) {
    return organizations.find(o => o.id === id);
  },
  async getOrganizationByUserId(userId) {
    const u = usersById.get(userId);
    if (!u?.organizationId) return undefined;
    return organizations.find(o => o.id === u.organizationId);
  },
  async updateOrganization(id, updates) {
    const idx = organizations.findIndex(o => o.id === id);
    organizations[idx] = { ...organizations[idx], ...updates, updatedAt: new Date() } as Organization;
    return organizations[idx];
  },

  async getBranches(organizationId) {
    return branchesArr.filter(b => b.organizationId === organizationId).sort((a,b) => a.name.localeCompare(b.name));
  },
  async getBranch(id) {
    return branchesArr.find(b => b.id === id);
  },
  async createBranch(data) {
    const b: Branch = {
      id: branchId++,
      organizationId: data.organizationId,
      name: data.name,
      address: data.address as any,
      phone: data.phone as any,
      email: data.email as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    branchesArr.push(b);
    return b;
  },
  async updateBranch(id, updates) {
    const idx = branchesArr.findIndex(b => b.id === id);
    branchesArr[idx] = { ...branchesArr[idx], ...updates, updatedAt: new Date() } as Branch;
    return branchesArr[idx];
  },
  async deleteBranch(id) {
    const i = branchesArr.findIndex(b => b.id === id);
    if (i >= 0) branchesArr.splice(i, 1);
  },

  async getEvents(organizationId, branchIdFilter) {
    return eventsArr
      .filter(e => e.organizationId === organizationId && (!branchIdFilter || e.branchId === branchIdFilter))
      .sort((a,b) => (a.startDate > b.startDate ? -1 : 1));
  },
  async getEvent(id) {
    return eventsArr.find(e => e.id === id);
  },
  async createEvent(data) {
    const e: Event = {
      id: eventId++,
      organizationId: data.organizationId,
      title: data.title,
      description: data.description as any,
      startDate: data.startDate,
      startTime: data.startTime,
      endDate: data.endDate as any,
      endTime: data.endTime as any,
      location: data.location as any,
      category: (data as any).category || 'other',
      branchId: data.branchId,
      createdBy: data.createdBy,
      maxAttendees: (data as any).maxAttendees,
      requiresRsvp: (data as any).requiresRsvp ?? false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    eventsArr.push(e);
    return e;
  },
  async updateEvent(id, updates) {
    const idx = eventsArr.findIndex(e => e.id === id);
    eventsArr[idx] = { ...eventsArr[idx], ...updates, updatedAt: new Date() } as Event;
    return eventsArr[idx];
  },
  async deleteEvent(id) {
    const i = eventsArr.findIndex(e => e.id === id);
    if (i >= 0) eventsArr.splice(i, 1);
  },

  async createRsvp(rsvp) {
    const r: EventRsvp = { id: rsvpId++, createdAt: new Date(), ...rsvp } as EventRsvp;
    rsvpsArr.push(r);
    return r;
  },
  async getRsvpsForEvent(eventId) {
    return rsvpsArr.filter(r => r.eventId === eventId);
  },
  async getUserRsvp(eventId, userId) {
    return rsvpsArr.find(r => r.eventId === eventId && r.userId === userId);
  },
  async updateRsvp(eventId, userId, status) {
    const idx = rsvpsArr.findIndex(r => r.eventId === eventId && r.userId === userId);
    rsvpsArr[idx] = { ...rsvpsArr[idx], status: status as any } as EventRsvp;
    return rsvpsArr[idx];
  },

  async getPosts(organizationId, branchIdFilter) {
    return postsArr
      .filter(p => p.organizationId === organizationId && (!branchIdFilter || p.branchId === branchIdFilter))
      .sort((a,b) => (a.createdAt > b.createdAt ? -1 : 1));
  },
  async getPost(id) {
    return postsArr.find(p => p.id === id);
  },
  async createPost(data) {
    const p: Post = {
      id: postId++,
      organizationId: data.organizationId,
      title: data.title,
      content: data.content,
      type: (data as any).type || 'announcement',
      branchId: data.branchId,
      createdBy: (data as any).createdBy || (data as any).authorId,
      scheduledFor: (data as any).scheduledFor,
      publishedAt: (data as any).publishedAt,
      isPublished: (data as any).isPublished ?? false,
      socialPlatforms: (data as any).socialPlatforms || [],
      imageUrl: (data as any).imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    postsArr.push(p);
    return p;
  },
  async updatePost(id, updates) {
    const idx = postsArr.findIndex(p => p.id === id);
    postsArr[idx] = { ...postsArr[idx], ...updates, updatedAt: new Date() } as Post;
    return postsArr[idx];
  },
  async deletePost(id) {
    const i = postsArr.findIndex(p => p.id === id);
    if (i >= 0) postsArr.splice(i, 1);
  },

  async getNotifications(userId) {
    return notificationsArr.filter(n => n.userId === userId).sort((a,b) => (a.createdAt > b.createdAt ? -1 : 1));
  },
  async createNotification(data) {
    const n: Notification = { id: notificationId++, createdAt: new Date(), isRead: false, ...data } as Notification;
    notificationsArr.push(n);
    return n;
  },
  async markNotificationRead(id) {
    const idx = notificationsArr.findIndex(n => n.id === id);
    if (idx >= 0) notificationsArr[idx] = { ...notificationsArr[idx], isRead: true } as Notification;
  },

  async getActivityLogs(organizationId, branchIdFilter, limit = 50) {
    return activityArr
      .filter(a => a.organizationId === organizationId && (!branchIdFilter || a.branchId === branchIdFilter))
      .sort((a,b) => (a.createdAt > b.createdAt ? -1 : 1))
      .slice(0, limit);
  },
  async createActivityLog(log) {
    const a: ActivityLog = {
      id: activityId++,
      createdAt: new Date(),
      details: (log as any).details,
      ...log,
    } as ActivityLog;
    activityArr.push(a);
    return a;
  },

  async getSettings(organizationId) {
    const org = organizations.find(o => o.id === organizationId);
    return org?.settings || {};
  },
  async updateSettings(organizationId, settings) {
    const idx = organizations.findIndex(o => o.id === organizationId);
    organizations[idx] = { ...organizations[idx], settings, updatedAt: new Date() } as Organization;
    return organizations[idx].settings;
  },

  async getEventStats(organizationId, branchIdFilter) {
    const relevant = eventsArr.filter(e => e.organizationId === organizationId && (!branchIdFilter || e.branchId === branchIdFilter));
    const upcoming = relevant.filter(e => new Date(e.startDate as any) > new Date());
    return {
      total: relevant.length,
      upcoming: upcoming.length,
      completed: Math.max(0, relevant.length - upcoming.length),
    };
  },
  async getSocialStats(organizationId, branchIdFilter) {
    const relevant = postsArr.filter(p => p.organizationId === organizationId && (!branchIdFilter || p.branchId === branchIdFilter));
    return {
      totalPosts: relevant.length,
      recentPosts: relevant.slice(0, 7).length,
      engagement: Math.floor(Math.random() * 100),
    };
  },
  async getUserStats(organizationId, branchIdFilter) {
    const relevant = Array.from(usersById.values()).filter(u => u.organizationId === organizationId && (!branchIdFilter || u.branchId === branchIdFilter));
    const active = relevant.filter(u => u.isActive);
    return {
      total: relevant.length,
      active: active.length,
      inactive: Math.max(0, relevant.length - active.length),
    };
  },
};
