import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { fetchCompaniesFromApollo } from '@/lib/apollo'; // استيراد الدالة الجديدة

export async function POST(request: NextRequest) {
  console.log('🚀 بدء API المزامنة');
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔑 Token موجود:', !!token);
    
    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      } catch {}
    }
    console.log('👤 المستخدم:', user?.name, user?.role);
    
    if (!user || user.role !== 'admin') {
      console.log('❌ غير مخول');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📝 بيانات الطلب:', body);
    const { limit = 50 } = body;
    const apolloApiKey = process.env.APOLLO_API_KEY;

    if (!apolloApiKey) {
      console.error('❌ مفتاح Apollo API غير موجود في متغيرات البيئة');
      return NextResponse.json({ error: 'Apollo API key is not configured' }, { status: 500 });
    }
    
    const pool = new Pool({
      connectionString: 'postgresql://neondb_owner:npg_0FTPBkvp7Hdo@ep-plain-queen-agvjzsen-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      const companies = await fetchCompaniesFromApollo(apolloApiKey, limit);
      
      console.log('الشركات الوهمية:', companies);
      console.log('عدد الشركات:', companies.length);
      
      if (!companies || companies.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'لم يتم جلب أي شركات من Apollo.io'
        });
      }
      
      let imported = 0;
      let skipped = 0;
      
      for (const company of companies) {
        try {
          console.log('محاولة إدراج شركة:', {
            name: company.name,
            email: company.email,
            industry: company.industry,
            size: company.size,
            location: company.location
          });
          
          // تحقق من وجود بيانات صحيحة
          console.log('فحص اسم الشركة:', {
            name: company.name,
            isEmpty: !company.name,
            isTrimEmpty: company.name?.trim() === '',
            isUnknown: company.name === 'Unknown Company'
          });
          
          if (!company.name || company.name.trim() === '' || company.name === 'Unknown Company') {
            console.log('❌ تم تخطي الشركة - اسم غير صحيح:', company.name);
            skipped++;
            continue;
          }
          
          console.log('✅ اسم الشركة صحيح، المتابعة...');
          
          const client = await pool.connect();
          
          // التحقق من وجود الشركة أولاً
          const existingResult = await client.query(
            'SELECT id, name FROM companies WHERE LOWER(name) = LOWER($1)',
            [company.name.trim()]
          );
          
          const existing = existingResult.rows[0];
          console.log(`بحث عن شركة "${company.name}":`, existing);
          
          if (existing) {
            console.log('❌ الشركة موجودة مسبقاً:', company.name, '-> ID:', existing.id);
            skipped++;
          } else {
            console.log('✅ شركة جديدة، بدء الإدراج:', company.name);
            
            const result = await client.query(`
              INSERT INTO companies (name, email, industry, size, location, status, created_at)
              VALUES ($1, $2, $3, $4, $5, 'uncontacted', CURRENT_TIMESTAMP)
              RETURNING id
            `, [
              company.name.trim(),
              company.email || null,
              company.industry || null,
              company.size || null,
              company.location || null
            ]);
            
            if (result.rows.length > 0) {
              imported++;
              console.log('✅ تم إدراج الشركة بنجاح - ID:', result.rows[0].id);
            } else {
              console.log('❌ فشل في إدراج الشركة');
              skipped++;
            }
          }
          
          client.release();
        } catch (error) {
          console.error('خطأ في إدراج الشركة:', error);
          console.error('بيانات الشركة:', company);
          skipped++;
        }
      }
      
      await pool.end();
      
      const result = { 
        success: true,
        message: `تمت مزامنة ${companies.length} شركة، تم إضافة ${imported} شركة جديدة`,
        imported, 
        skipped, 
        total: companies.length
      };
      
      console.log('✅ نتيجة المزامنة:', result);
      return NextResponse.json(result);
    } catch (syncError: any) {
      try {
        await pool.end();
      } catch {}
      console.error('Sync Error:', syncError.message);
      return NextResponse.json({ 
        error: syncError.message || 'فشل في المزامنة',
        details: syncError.message
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ خطأ في المزامنة:', error);
    return NextResponse.json({ error: 'فشل في المزامنة' }, { status: 500 });
  }
}