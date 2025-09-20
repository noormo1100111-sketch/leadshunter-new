import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const { email, password, name } = await request.json();
    
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
      success: true,
      user: result.rows[0]
    });
    
  } catch (error: any) {
    await pool.end();
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}