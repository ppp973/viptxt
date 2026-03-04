import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readJson } from '@/backend/src/utils/storage';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lumina-key-2026';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const users = await readJson<any>('users.json');
    const user = users.find((u: any) => u.id === decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username,
        isAdmin: decoded.isAdmin || user.isAdmin,
        studentId: user.studentId
      } 
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}
