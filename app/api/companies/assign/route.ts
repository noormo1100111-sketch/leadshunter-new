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

    const { companyIds, userId } = await request.json();
    
    for (const companyId of companyIds) {
      await run(`
        UPDATE companies 
        SET assigned_to = ?, status = 'assigned'
        WHERE id = ? AND status = 'uncontacted'
      `, [userId, companyId]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 });
  }
}