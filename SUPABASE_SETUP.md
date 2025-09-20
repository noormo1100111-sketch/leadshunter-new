# إعداد Supabase

## 1. إنشاء مشروع Supabase

1. اذهب إلى https://supabase.com
2. اضغط "Start your project"
3. سجل دخول أو أنشئ حساب جديد
4. اضغط "New Project"
5. اختر Organization أو أنشئ واحدة جديدة
6. املأ البيانات:
   - **Name**: leadshunter
   - **Database Password**: اختر كلمة مرور قوية واحفظها
   - **Region**: اختر أقرب منطقة لك
7. اضغط "Create new project"

## 2. الحصول على رابط قاعدة البيانات

1. في لوحة تحكم Supabase، اذهب إلى **Settings** > **Database**
2. انسخ **Connection string** من قسم **Connection parameters**
3. الرابط سيكون بهذا الشكل:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها

## 3. تحديث متغيرات البيئة

في ملف `.env.local`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 4. تشغيل المشروع

```bash
npm install
npm run dev
```

سيتم إنشاء الجداول تلقائياً عند أول تشغيل.

## 5. التحقق من قاعدة البيانات

1. في Supabase، اذهب إلى **Table Editor**
2. ستجد جدولين:
   - `users` - المستخدمين
   - `companies` - الشركات
3. المستخدم الافتراضي:
   - **البريد**: admin@leadshunter.com
   - **كلمة المرور**: password

## ملاحظات مهمة

- Supabase يوفر 500MB مجاناً
- يدعم 2 مشاريع مجانية
- قاعدة البيانات تعمل 24/7
- نسخ احتياطية تلقائية
- SSL مُفعل افتراضياً