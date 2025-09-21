import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
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
    let paramIndex = 1;
    
    if (search) {
      // Use ILIKE for case-insensitive search in PostgreSQL
      whereClause += ` WHERE (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR industry ILIKE $${paramIndex})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      // This is incorrect logic for parameter indexing. Let's fix it.
      // The correct way is to build the params array and the query string together.
      // Let's simplify.
      whereClause = ` WHERE (name ILIKE $1 OR email ILIKE $1 OR industry ILIKE $1)`;
      params = [`%${search}%`];
      paramIndex = 2;
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
    
    const companiesQuery = `
      SELECT c.*, u.name as assigned_user_name, cu.name as contacted_user_name
      FROM companies c
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN users cu ON c.contacted_by = cu.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const companiesResult = await db.query(companiesQuery, [...params, limit, offset]);
    
    const totalQuery = `SELECT COUNT(*) as total FROM companies${whereClause}`;
    // The params for count should not include limit and offset
    const totalResult = await db.query(totalQuery, params.slice(0, paramIndex - 1));
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
    console.error('❌ Companies fetch error:', error);
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
    
    const result = await db.query(`
      INSERT INTO companies (name, email, industry, size, location, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'uncontacted', CURRENT_TIMESTAMP)
      RETURNING id
    `, [name, email, industry, size, location]);
    
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error: any) {
    console.error('❌ Company creation error:', error);
    const isDuplicate = error.code === '23505'; // PostgreSQL unique violation code
    const errorMessage = isDuplicate ? `شركة باسم "${(await request.json()).name}" موجودة بالفعل.` : 'Failed to create company';
    return NextResponse.json({ error: errorMessage }, { status: isDuplicate ? 409 : 500 });
  }
}