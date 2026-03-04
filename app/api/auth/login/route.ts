import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readJson } from '@/backend/src/utils/storage';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lumina-key-2026';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const users = await readJson<any>('users.json');
    let user = users.find((u: any) => u.username === username || u.studentId === username);

    // Master Admin Password check: "LuminaAdmin2026"
    const isMasterPassword = password === 'LuminaAdmin2026';
    
    // Auto-create admin if it doesn't exist and master password is used
    if (!user && isMasterPassword && username === 'admin') {
      const { v4: uuidv4 } = await import('uuid');
      const bcrypt = await import('bcryptjs');
      const { writeJson } = await import('@/backend/src/utils/storage');
      
      const passwordHash = await bcrypt.hash(password, 10);
      user = {
        id: uuidv4(),
        name: 'Administrator',
        username: 'admin',
        passwordHash,
        isAdmin: true,
        studentId: 'LUM-ADMIN',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      await writeJson('users.json', users);
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword && !isMasterPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // If master password is used, ensure the user is an admin
    const finalIsAdmin = user.isAdmin || isMasterPassword;

    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      isAdmin: finalIsAdmin,
      studentId: user.studentId 
    }, JWT_SECRET, { expiresIn: '7d' });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username,
        isAdmin: finalIsAdmin,
        studentId: user.studentId
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
