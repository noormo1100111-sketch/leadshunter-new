import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const timestamp = Date.now();
    const companies = [
      { name: `أرامكو السعودية ${timestamp}`, email: `contact${timestamp}@aramco.com`, industry: 'النفط والغاز', size: 'كبيرة', location: 'السعودية' },
      { name: `بنك الإمارات دبي الوطني ${timestamp}`, email: `info${timestamp}@emiratesnbd.ae`, industry: 'البنوك', size: 'كبيرة', location: 'الإمارات' },
      { name: `مجموعة طلعت مصطفى ${timestamp}`, email: `contact${timestamp}@tmg-holding.com`, industry: 'العقارات', size: 'كبيرة', location: 'مصر' },
      { name: `شركة الاتصالات السعودية ${timestamp}`, email: `support${timestamp}@stc.com.sa`, industry: 'الاتصالات', size: 'كبيرة', location: 'السعودية' },
      { name: `بنك قطر الوطني ${timestamp}`, email: `hello${timestamp}@qnb.com`, industry: 'البنوك', size: 'كبيرة', location: 'قطر' }
    ];
    
    const client = await pool.connect();
    let imported = 0;
    
    for (const company of companies) {
      const result = await client.query(
        'INSERT INTO companies (name, email, industry, size, location, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id',
        [company.name, company.email, company.industry, company.size, company.location, 'uncontacted']
      );
      
      if (result.rows.length > 0) {
        imported++;
        console.log('Added company:', company.name, 'ID:', result.rows[0].id);
      }
    }
    
    client.release();
    await pool.end();
    
    return NextResponse.json({
      success: true,
      message: `تم إضافة ${imported} شركة جديدة`,
      imported
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