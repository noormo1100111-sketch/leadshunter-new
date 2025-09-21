import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع ملف' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على بيانات' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers);
    
    const client = await pool.connect();
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) continue;
      
      const company = {
        name: values[headers.indexOf('name')] || values[headers.indexOf('company_name')] || values[0],
        email: values[headers.indexOf('email')] || values[headers.indexOf('company_email')] || '',
        industry: values[headers.indexOf('industry')] || values[headers.indexOf('sector')] || '',
        size: values[headers.indexOf('size')] || values[headers.indexOf('company_size')] || 'متوسطة',
        location: values[headers.indexOf('location')] || values[headers.indexOf('country')] || values[headers.indexOf('city')] || ''
      };

      if (!company.name || company.name.length < 2) {
        skipped++;
        continue;
      }

      try {
        const result = await client.query(
          'INSERT INTO companies (name, email, industry, size, location, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id',
          [company.name, company.email, company.industry, company.size, company.location, 'uncontacted']
        );
        
        if (result.rows.length > 0) {
          imported++;
        }
      } catch (insertError) {
        console.log('Company might already exist:', company.name);
        skipped++;
      }
    }

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: `تم رفع الملف بنجاح. تم إضافة ${imported} شركة، تم تخطي ${skipped} شركة`,
      imported,
      skipped,
      total: lines.length - 1
    });

  } catch (error) {
    try {
      await pool.end();
    } catch {}
    console.error('CSV upload error:', error);
    return NextResponse.json({ 
      error: 'فشل في رفع الملف',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}