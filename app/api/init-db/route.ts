import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/supabase';

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}