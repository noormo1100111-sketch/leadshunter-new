import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase'; // استيراد الاتصال المركزي
import { fetchCompaniesFromApollo } from '@/lib/apollo'; // استيراد الدالة الجديدة
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🚀 بدء API المزامنة');
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔑 Token موجود:', !!token);
    
    const user = token ? verifyToken(token) : null;
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
      
      // Connect to the database once before the loop
      const client = await db.connect();
      try {
        for (const company of companies) {
          try {
            if (!company.name || company.name.trim() === '' || company.name === 'Unknown Company') {
              console.log('🟡 تم تخطي الشركة - اسم غير صالح:', company.name);
              skipped++;
              continue;
            }

            // استخدام ON CONFLICT لتجنب البحث المسبق وتحسين الأداء
            const result = await client.query(`
              INSERT INTO companies (name, email, industry, size, location, status, created_at)
              VALUES ($1, $2, $3, $4, $5, 'uncontacted', CURRENT_TIMESTAMP)
              ON CONFLICT (name) DO NOTHING
              RETURNING id
            `, [
              company.name.trim(),
              company.email || null,
              company.industry || null,
              company.size || null,
              company.location || null,
            ]);

            if (result.rowCount > 0) {
              imported++;
              console.log('✅ تم إدراج الشركة بنجاح:', company.name, '-> ID:', result.rows[0].id);
            } else {
              skipped++;
              console.log('🟡 الشركة موجودة مسبقاً، تم التخطي:', company.name);
            }
          } catch (error) {
            console.error('خطأ في إدراج الشركة:', error);
            console.error('بيانات الشركة:', company);
            skipped++;
          }
        }
      } finally {
        // Release the client back to the pool
        client.release();
        console.log('🔌 تم تحرير اتصال قاعدة البيانات.');
      }
      
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