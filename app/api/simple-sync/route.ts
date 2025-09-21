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
    const companyTemplates = {
      'السعودية': [
        { name: 'أرامكو', domain: 'aramco.com', industry: 'النفط والغاز' },
        { name: 'شركة الاتصالات السعودية', domain: 'stc.com.sa', industry: 'الاتصالات' },
        { name: 'بنك الراجحي', domain: 'alrajhibank.com.sa', industry: 'البنوك' }
      ],
      'الإمارات': [
        { name: 'بنك الإمارات دبي الوطني', domain: 'emiratesnbd.ae', industry: 'البنوك' },
        { name: 'طيران الإمارات', domain: 'emirates.com', industry: 'الطيران' },
        { name: 'مجموعة ماجد الفطيم', domain: 'majidgroup.com', industry: 'التجارة' }
      ],
      'مصر': [
        { name: 'مجموعة طلعت مصطفى', domain: 'tmg-holding.com', industry: 'العقارات' },
        { name: 'بنك مصر', domain: 'banquemisr.com', industry: 'البنوك' },
        { name: 'اورانج مصر', domain: 'orange.eg', industry: 'الاتصالات' }
      ],
      'قطر': [
        { name: 'بنك قطر الوطني', domain: 'qnb.com', industry: 'البنوك' },
        { name: 'الخطوط الجوية القطرية', domain: 'qatarairways.com', industry: 'الطيران' }
      ]
    };
    
    const companies = [];
    let companyCount = 0;
    
    for (const location of locations) {
      if (companyCount >= limit) break;
      
      const templates = companyTemplates[location] || [];
      for (const template of templates) {
        if (companyCount >= limit) break;
        
        companies.push({
          name: `${template.name} ${timestamp}`,
          email: `contact${timestamp}@${template.domain}`,
          industry: template.industry,
          size: companySizes[0] || 'كبيرة',
          location: location
        });
        companyCount++;
      }
    }
    
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