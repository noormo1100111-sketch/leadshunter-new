import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const body = await request.json();
    const { locations = ['السعودية'], industries = ['تكنولوجيا'], companySizes = ['كبيرة'], limit = 5 } = body;
    
    console.log('إعدادات البحث:', { locations, industries, companySizes, limit });
    
    const timestamp = Date.now();
    
    // إنشاء شركات بناءً على الإعدادات
    const companies = [];
    
    for (let i = 0; i < limit; i++) {
      const locationIndex = i % locations.length;
      const location = locations[locationIndex];
      
      companies.push({
        name: `شركة ${location} ${timestamp + i}`,
        email: `contact${timestamp + i}@company.com`,
        industry: industries[0] || 'تكنولوجيا',
        size: 'كبيرة',
        location: location
      });
    }
    
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