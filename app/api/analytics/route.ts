import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Companies by status
    const statusStats = await query(`
      SELECT status, COUNT(*) as count
      FROM companies
      ${user.role !== 'admin' ? 'WHERE assigned_to = ?' : ''}
      GROUP BY status
    `, user.role !== 'admin' ? [user.id] : []);

    // Companies contacted per user (admin only)
    let userStats = [];
    if (user.role === 'admin') {
      userStats = await query(`
        SELECT u.name, COUNT(c.id) as contacted_count
        FROM users u
        LEFT JOIN companies c ON u.id = c.contacted_by
        WHERE u.role = 'user'
        GROUP BY u.id, u.name
        ORDER BY contacted_count DESC
      `);
    }

    // Total counts
    const totalCompanies = await query(`
      SELECT COUNT(*) as total FROM companies
      ${user.role !== 'admin' ? 'WHERE assigned_to = ?' : ''}
    `, user.role !== 'admin' ? [user.id] : []);

    const contactedCompanies = await query(`
      SELECT COUNT(*) as total FROM companies
      WHERE status = 'contacted'
      ${user.role !== 'admin' ? 'AND assigned_to = ?' : ''}
    `, user.role !== 'admin' ? [user.id] : []);

    return NextResponse.json({
      statusStats,
      userStats,
      totalCompanies: totalCompanies[0].total,
      contactedCompanies: contactedCompanies[0].total
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}