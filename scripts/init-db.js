const { initDatabase } = require('../lib/supabase');

async function initDB() {
  try {
    await initDatabase();
    console.log('✅ تم إنشاء قاعدة البيانات بنجاح');
    console.log('📋 تم إنشاء المستخدم الافتراضي:');
    console.log('   البريد: admin@leadshunter.com');
    console.log('   كلمة المرور: password');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء قاعدة البيانات:', error);
    process.exit(1);
  }
}

initDB();