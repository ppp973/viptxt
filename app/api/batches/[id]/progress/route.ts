import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readJson, writeJson } from '@/backend/src/utils/storage';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lumina-key-2026';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; isAdmin: boolean; studentId: string };
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { url, position } = await request.json();

  const batches = await readJson<any>('batches.json');
  const batchIndex = batches.findIndex((b: any) => b.id === id && b.userId === user.id);

  if (batchIndex === -1) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 });
  }

  if (!batches[batchIndex].progress) {
    batches[batchIndex].progress = {};
  }

  batches[batchIndex].progress[url] = position;
  await writeJson('batches.json', batches);

  return NextResponse.json({ success: true });
}
