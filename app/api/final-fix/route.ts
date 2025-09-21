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
    
    // Drop and recreate tables
    await client.query('DROP TABLE IF EXISTS companies CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    // Create users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create companies table
    await client.query(`
      CREATE TABLE companies (
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

    // Create admin user with known password
    const hashedPassword = await bcrypt.hash('password', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role) 
      VALUES ($1, $2, $3, $4)
    `, ['admin@leadshunter.com', hashedPassword, 'Admin', 'admin']);

    // Test the password
    const testUser = await client.query('SELECT * FROM users WHERE email = $1', ['admin@leadshunter.com']);
    const passwordTest = await bcrypt.compare('password', testUser.rows[0].password);

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Database completely reset and admin created',
      credentials: {
        email: 'admin@leadshunter.com',
        password: 'password'
      },
      password_test: passwordTest,
      user_created: testUser.rows[0] ? true : false
    });

  } catch (error: any) {
    await pool.end();
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}