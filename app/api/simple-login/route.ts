import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (email === 'admin@leadshunter.com' && password === 'password') {
      const token = jwt.sign(
        { id: 1, email: 'admin@leadshunter.com', role: 'admin' },
        'fallback-secret',
        { expiresIn: '7d' }
      );
      
      return NextResponse.json({
        token,
        user: { id: 1, email: 'admin@leadshunter.com', name: 'Admin', role: 'admin' }
      });
    }
    
    return NextResponse.json({ error: 'بيانات خاطئة' }, { status: 401 });
    
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}