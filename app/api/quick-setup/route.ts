import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Database connection timeout - use alternative method',
    solution: 'Create new account from Register page - first user becomes admin automatically',
    fallback_credentials: {
      note: 'Try these if database works later',
      email: 'admin@leadshunter.com',
      password: 'password'
    }
  });
}