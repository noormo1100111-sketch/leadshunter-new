import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function GET() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, name, role',
      [hashedPassword, 'admin@leadshunter.com']
    );
    
    client.release();
    await pool.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully',
      credentials: {
        email: 'admin@leadshunter.com',
        password: 'password'
      }
    });
    
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    return NextResponse.json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}