import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    const pool = new Pool({
      host: 'db.bwpxsomsllsfukvwusjx.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'As050050@@@@',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });

    const client = await pool.connect();
    
    const result = await client.query('SELECT NOW()');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    let userCount = { rows: [{ count: '0' }] };
    try {
      userCount = await client.query('SELECT COUNT(*) as count FROM users');
    } catch (e) {
      // Table might not exist
    }
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      success: true,
      connection: 'OK with IPv4',
      time: result.rows[0].now,
      tables: tables.rows.map(t => t.table_name),
      user_count: userCount.rows[0].count
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}