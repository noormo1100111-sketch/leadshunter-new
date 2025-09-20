import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function GET() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:As050050@@@@db.bwpxsomsllsfukvwusjx.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        industry VARCHAR(255),
        size VARCHAR(100),
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'uncontacted',
        assigned_to INTEGER REFERENCES users(id),
        contacted_by INTEGER REFERENCES users(id),
        contacted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const hashedPassword = await bcrypt.hash('password', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@leadshunter.com', hashedPassword, 'Admin', 'admin']);

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'New database setup complete!',
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