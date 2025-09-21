import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function GET() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // Delete existing admin
    await client.query('DELETE FROM users WHERE email = $1', ['admin@leadshunter.com']);
    
    // Create new admin with correct password
    const hashedPassword = await bcrypt.hash('password', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role) 
      VALUES ($1, $2, $3, $4)
    `, ['admin@leadshunter.com', hashedPassword, 'Admin', 'admin']);

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully!',
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