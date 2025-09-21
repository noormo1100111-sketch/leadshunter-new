# إعداد قاعدة بيانات Neon

Neon هو خيار ممتاز لقواعد بيانات PostgreSQL المتوافقة مع بيئات Serverless مثل Vercel.

## 1. إنشاء مشروع Neon

1.  اذهب إلى console.neon.tech وأنشئ حسابًا جديدًا (يمكنك استخدام حساب Google, GitHub, أو البريد الإلكتروني).
2.  بعد التسجيل، سيُطلب منك إنشاء مشروع جديد.
3.  املأ البيانات:
    - **Project name**: `leadshunter`
    - **Database name**: `neondb` (أو أي اسم تفضله)
    - **Region**: اختر أقرب منطقة لك.
4.  اضغط "Create project".

## 2. الحصول على رابط الاتصال

1.  بعد إنشاء المشروع، ستظهر لك لوحة التحكم.
2.  في قسم **Connection Details**، ستجد بطاقة بعنوان "Connection String".
3.  انسخ رابط الاتصال (Connection String). سيبدو بهذا الشكل:
    ```
    postgres://[user]:[password]@[endpoint_hostname].neon.tech/neondb?sslmode=require
    ```
    هذا الرابط يحتوي على كلمة المرور وكل ما تحتاجه للاتصال.

## 3. تحديث متغيرات البيئة

افتح ملف `.env.local` في مشروعك وأضف/حدّث متغير `DATABASE_URL`:

```env
DATABASE_URL="postgres://[user]:[password]@[endpoint_hostname].neon.tech/neondb?sslmode=require"
```

**ملاحظة هامة:** من الأفضل وضع الرابط بين علامتي اقتباس `"` لتجنب أي مشاكل مع الأحرف الخاصة في كلمة المرور.

## 4. تشغيل المشروع وإنشاء الجداول

عند نشر المشروع على Vercel أو تشغيله محلياً لأول مرة، تحتاج إلى إنشاء الجداول والمستخدم المدير.

1.  شغّل المشروع.
2.  اذهب إلى الرابط `/api/create-admin` في متصفحك مرة واحدة فقط.
    - **محلياً**: `http://localhost:3000/api/create-admin`
    - **بعد النشر**: `https://your-app-name.vercel.app/api/create-admin`

سيقوم هذا الإجراء بإنشاء جدولي `users` و `companies` وإضافة المستخدم `admin@leadshunter.com` بكلمة مرور `password`.