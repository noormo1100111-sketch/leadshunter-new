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
      { name: `Microsoft Corp ${timestamp}`, email: `contact${timestamp}@microsoft.com`, industry: 'Technology', size: 'Large', location: 'USA' },
      { name: `Google Inc ${timestamp}`, email: `info${timestamp}@google.com`, industry: 'Technology', size: 'Large', location: 'USA' },
      { name: `Apple Ltd ${timestamp}`, email: `support${timestamp}@apple.com`, industry: 'Technology', size: 'Large', location: 'USA' },
      { name: `Amazon Co ${timestamp}`, email: `hello${timestamp}@amazon.com`, industry: 'E-commerce', size: 'Large', location: 'USA' },
      { name: `Meta Inc ${timestamp}`, email: `contact${timestamp}@meta.com`, industry: 'Social Media', size: 'Large', location: 'USA' }
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