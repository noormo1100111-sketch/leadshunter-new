import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/auth';
import { initDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const { email, password, name } = await request.json();

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'المستخدم موجود بالفعل' }, { status: 400 });
    }

    const user = await createUser(email, password, name);
    
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'فشل في التسجيل' }, { status: 500 });
  }
}