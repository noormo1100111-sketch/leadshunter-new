import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  let body;
  try {
    body = await request.json();
    console.log('Login request body:', body);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
  }

  try {
    const { email, password } = body;
    
    // Validation
    console.log('Validating login:', { email: !!email, password: !!password });
    if (!email || !password) {
      console.log('Login validation failed - missing fields');
      return NextResponse.json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    console.log('Querying user with email:', email);
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('Query result rows count:', result.rows.length);
    const user = result.rows[0];
    
    if (!user) {
      console.log('User not found for email:', email);
      client.release();
      await pool.end();
      return NextResponse.json({ error: 'البريد الإلكتروني غير موجود' }, { status: 401 });
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      console.log('Password validation failed for user:', user.email);
      client.release();
      await pool.end();
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }
    
    console.log('Login successful for user:', user.email);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    console.error('Login error:', error);
    return NextResponse.json({ error: 'فشل في تسجيل الدخول' }, { status: 500 });
  }
}