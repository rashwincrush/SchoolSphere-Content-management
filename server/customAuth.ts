import express, { type Express, type RequestHandler } from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { users } from '@shared/schema';

// Interface for user credentials
interface Credentials {
  email: string;
  password: string;
}

type UserRole = 'owner' | 'admin' | 'teacher' | 'parent' | 'student';

// Custom user table extension to store passwords
interface UserWithPassword {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  organizationId: number;
}

// Hash password utility function
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password utility function
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Store for custom users with passwords
class CustomAuthStore {
  private users: Map<string, UserWithPassword> = new Map();
  
  // Initialize with default admin if needed
  constructor() {
    this.initializeAdminUser();
  }

  // Create initial admin user if one doesn't exist
  private async initializeAdminUser() {
    try {
      // Check if admin user exists in the database
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@schoolsphere.com';
      const existingUser = await this.getUserByEmail(adminEmail);
      
      if (!existingUser) {
        // Create default admin user
        const adminUser: UserWithPassword = {
          id: 'admin-user',
          email: adminEmail,
          password: await hashPassword(process.env.ADMIN_PASSWORD || 'Admin123!'),
          firstName: 'System',
          lastName: 'Administrator',
          role: 'owner' as UserRole,
          organizationId: 1
        };
        
        this.users.set(adminUser.email, adminUser);
        
        // Create in database too
        await storage.upsertUser({
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          organizationId: adminUser.organizationId
        });
        
        console.log(`Created default administrator: ${adminEmail}`);
      } else {
        // Load existing admin user
        this.users.set(existingUser.email, existingUser);
        console.log(`Loaded existing administrator: ${existingUser.email}`);
      }
    } catch (err) {
      console.error('Failed to initialize admin user:', err);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      // First check in-memory store
      if (this.users.has(email)) {
        return this.users.get(email) || null;
      }
      
      // If not found, check database
      const [userFromDb] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
        
      if (userFromDb) {
        // In a real implementation, you'd have a separate table for passwords
        // This is a simplified version that uses hardcoded passwords for the admin user only
        if (email === (process.env.ADMIN_EMAIL || 'admin@schoolsphere.com')) {
          const userWithPwd: UserWithPassword = {
            id: userFromDb.id,
            email: userFromDb.email || email,
            password: process.env.ADMIN_PASSWORD_HASH || 
                     '$2a$10$mCsEMjL0tIW6.vxb9yhXd.mHhO8OLscYoWA0bFYSvB/AiOTJ7Rfuq', // Default hash for "Admin123!"
            firstName: userFromDb.firstName,
            lastName: userFromDb.lastName,
            role: userFromDb.role as UserRole || 'owner' as UserRole,
            organizationId: userFromDb.organizationId || 1
          };
          this.users.set(email, userWithPwd);
          return userWithPwd;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error retrieving user by email:', err);
      return null;
    }
  }

  // Create or update user
  async upsertUser(userData: UserWithPassword): Promise<UserWithPassword> {
    // Hash password if it's not already hashed (starts with $2a$)
    if (userData.password && !userData.password.startsWith('$2a$')) {
      userData.password = await hashPassword(userData.password);
    }
    
    // Store in memory
    this.users.set(userData.email, userData);
    
    // Store in database (without password)
    await storage.upsertUser({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      organizationId: userData.organizationId
    });
    
    return userData;
  }
  
  // Authenticate user
  async authenticateUser(credentials: Credentials): Promise<any> {
    const { email, password } = credentials;
    
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null; // User not found
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return null; // Invalid password
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Create auth store instance
const customAuthStore = new CustomAuthStore();

// Setup auth middleware and routes
export function setupCustomAuth(app: Express) {
  // Session configuration
  app.set('trust proxy', 1);
  
  // Use PostgreSQL for session storage in production
  let sessionStore;
  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: 7 * 24 * 60 * 60, // 1 week
      tableName: "sessions",
    });
  }
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'production-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));
  
  // Login endpoint
  app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await customAuthStore.authenticateUser({ email, password });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Set user in session
      (req.session as any).user = { claims: { sub: user.id } };
      
      // Return user info
      return res.status(200).json(user);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Authentication failed' });
    }
  });
  
  // User info endpoint
  app.get('/api/auth/user', isCustomAuthenticated, async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req.session as any).user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Failed to retrieve user information' });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req: express.Request, res: express.Response) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Add admin user utility endpoint (protected, only for initial setup)
  app.post('/api/auth/setup-admin', async (req: express.Request, res: express.Response) => {
    try {
      // Check if this is allowed - should only be used during initial setup
      if (process.env.ALLOW_ADMIN_SETUP !== '1') {
        return res.status(403).json({ message: 'Admin setup is not allowed' });
      }
      
      const { email, password, firstName, lastName, organizationId } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Create admin user
      const adminUser = await customAuthStore.upsertUser({
        id: `admin-${Date.now()}`,
        email,
        password,
        firstName: firstName || 'Admin',
        lastName: lastName || 'User',
        role: 'owner' as UserRole,
        organizationId: organizationId || 1
      });
      
      const { password: _, ...adminWithoutPassword } = adminUser;
      
      return res.status(200).json({
        message: 'Admin user created successfully',
        user: adminWithoutPassword
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      return res.status(500).json({ message: 'Failed to create admin user' });
    }
  });
}

// Auth middleware
export const isCustomAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session || !(req.session as any).user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = (req.session as any).user?.claims?.sub;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Verify the user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set user's last login time
    await storage.updateUserProfile(userId, { 
      lastLoginAt: new Date() 
    });
    
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
