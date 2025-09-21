import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
  try {
    const { rows: testQueryRows } = await db.query('SELECT NOW() as current_time');
    const { rows: tablesCheckRows } = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'companies')
    `);
    const { rows: userCountRows } = await db.query('SELECT COUNT(*) as count FROM users');
    const { rows: companyCountRows } = await db.query('SELECT COUNT(*) as count FROM companies');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: {
        currentTime: testQueryRows[0]?.current_time,
        tablesFound: tablesCheckRows.map(t => t.table_name),
        userCount: userCountRows[0]?.count || 0,
        companyCount: companyCountRows[0]?.count || 0
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}