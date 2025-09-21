import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // Check if admin exists
    const existingAdmin = await client.query("SELECT id FROM users WHERE email = 'admin@leadshunter.com'");
    
    if (existingAdmin.rows.length > 0) {
      client.release();
      await pool.end();
      return NextResponse.json({ message: 'Admin already exists' });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const result = await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      ['admin@leadshunter.com', hashedPassword, 'Admin User', 'admin']
    );
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    console.error('Create admin error:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}