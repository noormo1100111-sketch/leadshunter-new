import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const companies = [
      { name: 'Microsoft Corporation', email: 'contact@microsoft.com', industry: 'Technology', size: 'Large', location: 'USA' },
      { name: 'Google LLC', email: 'info@google.com', industry: 'Technology', size: 'Large', location: 'USA' },
      { name: 'Apple Inc', email: 'support@apple.com', industry: 'Technology', size: 'Large', location: 'USA' },
      { name: 'Amazon.com Inc', email: 'hello@amazon.com', industry: 'E-commerce', size: 'Large', location: 'USA' },
      { name: 'Meta Platforms Inc', email: 'contact@meta.com', industry: 'Social Media', size: 'Large', location: 'USA' }
    ];
    
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
        }
      } catch (error) {
        console.log('Company already exists or error:', company.name);
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