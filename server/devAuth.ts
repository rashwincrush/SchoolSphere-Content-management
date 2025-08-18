import type { Express, RequestHandler } from 'express';
import session from 'express-session';
import { getStorage } from './storageProvider';

const DEV_USERS = [
  { id: 'demo-admin', email: 'admin@demo.school', password: 'demo123' },
  { id: 'demo-teacher', email: 'teacher@demo.school', password: 'demo123' },
];

export function setupDevAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  // Simple GET login to align with client button
  app.get('/api/login', async (req: any, res) => {
    const storage = await getStorage();
    const defaultUser = DEV_USERS[0];
    await storage.upsertUser({ id: defaultUser.id, email: defaultUser.email, firstName: 'Demo', lastName: 'Admin' });
    req.session.user = { claims: { sub: defaultUser.id } };
    res.redirect('/');
  });

  // Optional: POST credentials login
  app.post('/api/dev/login', async (req: any, res) => {
    const { email, password } = req.body || {};
    const found = DEV_USERS.find(u => u.email === email && u.password === password);
    if (!found) return res.status(401).json({ message: 'Invalid credentials' });
    const storage = await getStorage();
    await storage.upsertUser({ id: found.id, email: found.email });
    req.session.user = { claims: { sub: found.id } };
    res.json({ ok: true });
  });

  app.get('/api/logout', (req: any, res) => {
    req.session.destroy(() => res.redirect('/'));
  });
}

export const isDevAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session && req.session.user && req.session.user.claims?.sub) return next();
  return res.status(401).json({ message: 'Unauthorized' });
};
