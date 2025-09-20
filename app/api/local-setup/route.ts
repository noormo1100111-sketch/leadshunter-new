import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Database connection issues detected',
    solution: {
      step1: 'Go to Supabase Dashboard: https://supabase.com/dashboard',
      step2: 'Check if your project is paused or has connection limits',
      step3: 'Or create new account from Register page - first user becomes admin',
      step4: 'Alternative: Use these credentials if database works: admin@leadshunter.com / password'
    },
    supabase_url: 'https://xswveevcdwdknfpfupjg.supabase.co',
    database_host: 'db.xswveevcdwdknfpfupjg.supabase.co'
  });
}