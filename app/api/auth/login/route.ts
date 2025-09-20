import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'بيانات خاطئة' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'بيانات خاطئة' }, { status: 401 });
    }

    const token = generateToken(user);
    
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'فشل في تسجيل الدخول' }, { status: 500 });
  }
}