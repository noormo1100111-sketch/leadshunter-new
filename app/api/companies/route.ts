import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      } catch {}
    }
    
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
    let paramIndex = 1;
    
    if (search) {
      whereClause += ` WHERE (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex+1} OR industry ILIKE $${paramIndex+2})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }
    
    if (status) {
      whereClause += whereClause ? ` AND status = $${paramIndex}` : ` WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (user.role !== 'admin') {
      whereClause += whereClause ? ` AND assigned_to = $${paramIndex}` : ` WHERE assigned_to = $${paramIndex}`;
      params.push(user.id);
      paramIndex++;
    }
    
    const offset = (page - 1) * limit;
    
    const companiesResult = await db.query(`
      SELECT c.*, u.name as assigned_user_name, cu.name as contacted_user_name
      FROM companies c
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN users cu ON c.contacted_by = cu.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex+1}
    `, [...params, limit, offset]);
    
    const totalResult = await db.query(`SELECT COUNT(*) as total FROM companies${whereClause}`, params);
    const total = parseInt(totalResult.rows[0].total);
    
    return NextResponse.json({
      companies: companiesResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Companies fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      } catch {}
    }
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, industry, size, location } = await request.json();
    
    const result = await db.query(`
      INSERT INTO companies (name, email, industry, size, location, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'uncontacted', CURRENT_TIMESTAMP)
      RETURNING id
    `, [name, email, industry, size, location]);
    
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}