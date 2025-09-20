import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    let whereClause = '';
    let params: any[] = [];
    
    if (search) {
      whereClause += ' WHERE (name LIKE ? OR email LIKE ? OR industry LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += whereClause ? ' AND status = ?' : ' WHERE status = ?';
      params.push(status);
    }
    
    if (user.role !== 'admin') {
      whereClause += whereClause ? ' AND assigned_to = ?' : ' WHERE assigned_to = ?';
      params.push(user.id);
    }
    
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    
    const companies = await query(`
      SELECT c.*, u.name as assigned_user_name, cu.name as contacted_user_name
      FROM companies c
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN users cu ON c.contacted_by = cu.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, params);
    
    const countParams = params.slice(0, -2);
    const totalResult = await query(`SELECT COUNT(*) as total FROM companies${whereClause}`, countParams);
    const total = totalResult[0].total;
    
    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, industry, size, location } = await request.json();
    
    const result = await run(`
      INSERT INTO companies (name, email, industry, size, location)
      VALUES (?, ?, ?, ?, ?)
    `, [name, email, industry, size, location]);
    
    return NextResponse.json({ id: result.lastID });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}