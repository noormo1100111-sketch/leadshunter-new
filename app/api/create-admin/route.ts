import { NextResponse } from 'next/server';
import { query, get } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
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

    // Check if admin already exists
    const adminExists = await get(
      'SELECT id FROM users WHERE email = $1',
      ['admin@leadshunter.com']
    );

    if (adminExists) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists',
        credentials: {
          email: 'admin@leadshunter.com',
          password: 'password'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create admin user
    await query(`
      INSERT INTO users (email, password, name, role) 
      VALUES ($1, $2, $3, $4)
    `, [
      'admin@leadshunter.com',
      hashedPassword,
      'Admin',
      'admin'
    ]);

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      credentials: {
        email: 'admin@leadshunter.com',
        password: 'password'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}