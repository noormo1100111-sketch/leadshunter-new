import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { fetchCompaniesFromSmartlead } from '@/lib/smartlead';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const body = await request.json();
    const { locations = ['السعودية'], industries = ['البنوك'], sizes = ['متوسطة'], limit = 5 } = body;
    
    console.log('إعدادات البحث:', { locations, industries, sizes, limit });
    
    // جلب شركات حقيقية من Smartlead مع الفلاتر
    const companies = await fetchCompaniesFromSmartlead(limit, { locations, industries, sizes });
    console.log('تم جلب', companies.length, 'شركة من Smartlead');
    
    const client = await pool.connect();
    let imported = 0;
    
    for (const company of companies) {
      try {
        const result = await client.query(
          'INSERT INTO companies (name, email, industry, size, location, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id',
          [company.name, company.email, company.industry, company.size, company.location, 'uncontacted']
        );
        
        if (result.rows.length > 0) {
          imported++;
          console.log('Added company:', company.name, 'ID:', result.rows[0].id);
        }
      } catch (insertError) {
        console.log('Company might already exist:', company.name);
      }
    }
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      success: true,
      message: `تم إضافة ${imported} شركة حقيقية من الشرق الأوسط`,
      imported,
      total: companies.length
    });
    
  } catch (error) {
    try {
      await pool.end();
    } catch {}
    return NextResponse.json({ 
      error: 'فشل في المزامنة',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}