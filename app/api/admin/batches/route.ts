import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readJson } from '@/backend/src/utils/storage';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lumina-key-2026';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getAuthUser();
  const adminSecret = req.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_PANEL_PASSWORD || 'Lumina_Admin_Secure_9921_X#$';

  if (!user || !user.isAdmin || adminSecret !== expectedSecret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const batches = await readJson<any>('batches.json');
  return NextResponse.json(batches);
}
