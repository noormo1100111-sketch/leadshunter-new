import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  let body;
  try {
    body = await request.json();
    console.log('Register request body:', body);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
  }

  try {
    const { email, password, name } = body;
    
    // Validation
    console.log('Validating:', { email: !!email, password: !!password, name: !!name });
    
    if (!email || !password || !name) {
      console.log('Missing fields validation failed');
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }
    
    if (password.length < 6) {
      console.log('Password length validation failed');
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Email format validation failed');
      return NextResponse.json({ error: 'بريد إلكتروني غير صحيح' }, { status: 400 });
    }
    
    console.log('All validations passed');
    
    const client = await pool.connect();
    
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      client.release();
      await pool.end();
      return NextResponse.json({ error: 'المستخدم موجود بالفعل' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const role = parseInt(userCount.rows[0].count) === 0 ? 'admin' : 'user';
    
    const result = await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, role]
    );
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      user: result.rows[0]
    });
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'فشل في التسجيل' }, { status: 500 });
  }
}