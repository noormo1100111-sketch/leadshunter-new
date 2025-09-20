import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await run('DELETE FROM companies');
    
    return NextResponse.json({ success: true, message: 'تم حذف جميع الشركات' });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json({ error: 'فشل في الحذف' }, { status: 500 });
  }
}