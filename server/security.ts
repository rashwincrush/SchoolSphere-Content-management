import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export function applySecurity(app: Express) {
  // Get the actual Replit domain from environment or use localhost for dev
  const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
  const allowed = [
    ...(replitDomain ? [`https://${replitDomain}`] : []),
    'http://localhost:5000',
    'https://localhost:5000'
  ];

  // Configure CORS
  app.use(cors({
    origin(origin: string | undefined, cb: (error: Error | null, allow?: boolean) => void) {
      const isDev = process.env.NODE_ENV === 'development';
      // In development, permit any localhost origin and requests without an Origin header (e.g., direct browser nav)
      if (isDev) {
        if (!origin) return cb(null, true);
        if (origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
          return cb(null, true);
        }
      }

      // Production and other cases: allow configured origins and Replit subdomains
      if (!origin || allowed.some(allowedOrigin =>
        origin === allowedOrigin || origin.endsWith('.replit.app')
      )) {
        return cb(null, true);
      }
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 600, // 10 minutes
  }));

  // Rate limiting for API routes
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    }
  }));

  // More restrictive rate limiting for auth endpoints
  app.use(['/api/login', '/api/callback'], rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit auth attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    }
  }));
}