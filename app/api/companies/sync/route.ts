import { NextRequest, NextResponse } from 'next/server';
import { fetchCompaniesFromApollo } from '@/lib/apollo';
import { run, get } from '@/lib/supabase';
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
    
    try {
      const companies = await fetchCompaniesFromApollo(limit);
      console.log('الشركات المجلبة من Apollo:', companies);
      console.log('عدد الشركات:', companies.length);
      
      // عرض جميع الشركات الموجودة في قاعدة البيانات
      const allExisting = await run('SELECT id, name FROM companies');
      console.log('الشركات الموجودة في قاعدة البيانات:', allExisting);
      
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
          
          // التحقق من وجود الشركة أولاً
          const existing = await get(`
            SELECT id, name FROM companies WHERE LOWER(name) = LOWER(?)
          `, [company.name.trim()]);
          
          console.log(`بحث عن شركة "${company.name}":`, existing);
          
          if (existing) {
            console.log('❌ الشركة موجودة مسبقاً:', company.name, '-> ID:', existing.id);
            
            // تحديث الشركة الموجودة ببيانات جديدة
            await run(`
              UPDATE companies 
              SET email = ?, industry = ?, size = ?, location = ?, updated_at = datetime('now')
              WHERE id = ?
            `, [
              company.email || existing.email,
              company.industry || existing.industry,
              company.size || existing.size,
              company.location || existing.location,
              existing.id
            ]);
            
            console.log('✅ تم تحديث الشركة الموجودة');
            imported++; // عدها كمعالجة
          } else {
            console.log('✅ شركة جديدة، بدء الإدراج:', company.name);
            
            const result = await run(`
              INSERT INTO companies (name, email, industry, size, location, status, created_at)
              VALUES (?, ?, ?, ?, ?, 'uncontacted', datetime('now'))
            `, [
              company.name.trim(),
              company.email || null,
              company.industry || null,
              company.size || null,
              company.location || null
            ]);
            
            console.log('نتيجة الإدراج:', result);
            
            console.log('نتيجة الإدراج:', result);
            
            if (result.changes && result.changes > 0) {
              imported++;
              console.log('✅ تم إدراج الشركة بنجاح - ID:', result.lastID);
            } else {
              console.log('❌ فشل في إدراج الشركة - لا تغييرات');
              skipped++;
            }
          }
        } catch (error) {
          console.error('خطأ في إدراج الشركة:', error);
          console.error('بيانات الشركة:', company);
          skipped++;
        }
      }
      
      const result = { 
        success: true,
        message: `تمت مزامنة ${companies.length} شركة، تم إضافة ${imported} شركة جديدة`,
        imported, 
        skipped, 
        total: companies.length,
        debug: {
          companiesFromApollo: companies.map(c => ({
            name: c.name,
            email: c.email,
            isValidName: !(!c.name || c.name.trim() === '' || c.name === 'Unknown Company')
          })),
          processLog: `Imported: ${imported}, Skipped: ${skipped}, Total: ${companies.length}`
        }
      };
      
      console.log('✅ نتيجة المزامنة:', result);
      return NextResponse.json(result);
    } catch (apolloError: any) {
      console.error('Sync Apollo Error:', apolloError.message);
      return NextResponse.json({ 
        error: apolloError.message || 'فشل في الاتصال بـ Apollo.io',
        details: apolloError.message
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ خطأ في المزامنة:', error);
    return NextResponse.json({ error: 'فشل في المزامنة' }, { status: 500 });
  }
}