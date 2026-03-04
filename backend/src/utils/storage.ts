import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');

// In-memory cache for serverless environments where filesystem is read-only
const memoryCache: Record<string, any[]> = {};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // If we can't create the directory, we'll likely be in a read-only environment
    // console.warn('Could not create data directory, falling back to in-memory storage');
  }
}

export async function readJson<T>(filename: string): Promise<T[]> {
  // Check memory cache first
  if (memoryCache[filename]) {
    return memoryCache[filename] as T[];
  }

  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    memoryCache[filename] = parsed; // Sync to cache
    return parsed;
  } catch (error) {
    // If file doesn't exist, try to write an empty array
    try {
      await writeJson(filename, []);
      return [];
    } catch (writeError) {
      // If writing fails (read-only FS), just use memory
      memoryCache[filename] = [];
      return [];
    }
  }
}

export async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  // Always update memory cache
  memoryCache[filename] = data;

  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    // Atomic write
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Fallback for read-only filesystem (Vercel/Netlify)
    // We already updated the memory cache, so the app will work for the current session
    // console.warn(`Could not write to ${filename}, using in-memory storage only`);
  }
}
