import { NextResponse } from 'next/server';
import { query, get } from '@/lib/supabase';

export async function GET() {
  try {
    const testQuery = await query('SELECT NOW() as current_time');
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'companies')
    `);
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    const companyCount = await get('SELECT COUNT(*) as count FROM companies');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: {
        currentTime: testQuery[0]?.current_time,
        tablesFound: tablesCheck.map(t => t.table_name),
        userCount: userCount?.count || 0,
        companyCount: companyCount?.count || 0
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}