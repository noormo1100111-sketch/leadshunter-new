import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // Clear all data
    await client.query('DELETE FROM companies');
    await client.query('DELETE FROM users');
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف جميع البيانات بنجاح'
    });
    
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    return NextResponse.json({ 
      error: 'فشل في حذف البيانات',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}