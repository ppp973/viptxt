import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '@/backend/src/utils/storage';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lumina-key-2026';

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const users = await readJson<any>('users.json');
    
    if (users.some((u: any) => u.username === username)) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    const isAdmin = users.length === 0;
    const studentId = `LUM-${Math.floor(100000 + Math.random() * 900000)}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      username,
      passwordHash,
      isAdmin,
      studentId,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJson('users.json', users);

    const token = jwt.sign({ 
      id: newUser.id, 
      username: newUser.username, 
      isAdmin: newUser.isAdmin,
      studentId: newUser.studentId 
    }, JWT_SECRET, { expiresIn: '7d' });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: true, // Always true for AI Studio iframe
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return NextResponse.json({ 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        studentId: newUser.studentId
      } 
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
