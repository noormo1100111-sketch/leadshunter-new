import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function GET() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:As050050@@@@@db.xswveevcdwdknfpfupjg.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    max: 1
  });

  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['admin@leadshunter.com']);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['admin@leadshunter.com', hashedPassword, 'Admin', 'admin']
      );
    }

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      credentials: {
        email: 'admin@leadshunter.com',
        password: 'password'
      }
    });

  } catch (error: any) {
    await pool.end();
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}