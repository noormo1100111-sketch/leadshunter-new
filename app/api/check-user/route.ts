import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const { email } = await request.json();
    
    const client = await pool.connect();
    const result = await client.query('SELECT id, email, name, role FROM users WHERE email = $1', [email]);
    
    client.release();
    await pool.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ found: false, message: 'User not found' });
    }
    
    return NextResponse.json({ 
      found: true, 
      user: result.rows[0],
      message: 'User exists'
    });
    
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}