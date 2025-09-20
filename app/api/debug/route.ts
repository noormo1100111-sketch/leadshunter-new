import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        env_vars: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
      });
    }

    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    // Test connection
    const result = await client.query('SELECT NOW()');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    // Check users count
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      time: result.rows[0].now,
      tables: tables.rows.map(t => t.table_name),
      user_count: userCount.rows[0].count,
      database_url_exists: !!dbUrl,
      database_url_preview: dbUrl.substring(0, 50) + '...'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database_url_exists: !!process.env.DATABASE_URL
    });
  }
}