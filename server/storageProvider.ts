import type { IStorage } from './storage';

export async function getStorage(): Promise<IStorage> {
  if (process.env.USE_DEV_AUTH === '1') {
    const mod = await import('./storage.memory');
    return mod.memoryStorage as IStorage;
  }
  const mod = await import('./storage');
  return (mod as any).storage as IStorage;
}
