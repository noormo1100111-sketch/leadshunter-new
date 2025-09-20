import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = parseInt(params.id);
    
    await run(`
      UPDATE companies 
      SET status = 'contacted', contacted_by = ?, contacted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND assigned_to = ?
    `, [user.id, companyId, user.id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark as contacted' }, { status: 500 });
  }
}