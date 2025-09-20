import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereClause = '';
    let params: any[] = [];
    
    if (user.role !== 'admin') {
      whereClause = ' WHERE assigned_to = ?';
      params.push(user.id);
    }
    
    const companies = await query(`
      SELECT name, email, industry, size, location, status, contacted_at
      FROM companies${whereClause}
      ORDER BY name
    `, params);
    
    const csvHeader = 'Name,Email,Industry,Size,Location,Status,Contacted At\n';
    const csvRows = companies.map(company => 
      `"${company.name}","${company.email || ''}","${company.industry || ''}","${company.size || ''}","${company.location || ''}","${company.status}","${company.contacted_at || ''}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="companies.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}