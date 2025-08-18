import type { Express, RequestHandler } from 'express';

export type AuthModule = {
  setupAuth(app: Express): Promise<void> | void;
  isAuthenticated: RequestHandler;
};

export async function getAuthModule(): Promise<AuthModule> {
  // Use development auth for local development
  if (process.env.USE_DEV_AUTH === '1') {
    console.log('Using development authentication');
    const mod = await import('./devAuth');
    return { setupAuth: mod.setupDevAuth, isAuthenticated: mod.isDevAuthenticated };
  }
  
  // Use custom auth provider if configured
  if (process.env.USE_CUSTOM_AUTH === '1') {
    console.log('Using custom production authentication');
    const mod = await import('./customAuth');
    return { setupAuth: mod.setupCustomAuth, isAuthenticated: mod.isCustomAuthenticated };
  }
  
  // Default to Replit auth for Replit environments
  console.log('Using Replit authentication');
  const mod = await import('./replitAuth');
  return { setupAuth: mod.setupAuth, isAuthenticated: mod.isAuthenticated };
}
