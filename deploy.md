# خطوات النشر السريع

## 1. Neon DB Setup
- اذهب إلى: https://neon.tech
- أنشئ مشروع: "leadshunter"
- احفظ كلمة المرور
- انسخ Connection String

## 2. Vercel Deployment
- اذهب إلى: https://vercel.com
- Import من GitHub: https://github.com/noormo1100111-sketch/leadshunter.git

## 3. Environment Variables في Vercel:
```
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
NEXTAUTH_SECRET = generate-32-char-random-string
JWT_SECRET = generate-another-32-char-random-string  
APOLLO_API_KEY = 784aIvGPQPBtdViVVbCQqw
NEXTAUTH_URL = https://your-app.vercel.app
```

## 4. بعد النشر:
- سجل دخول بـ: admin@leadshunter.com / password
- اضغط "مزامنة أبولو" لجلب الشركات
- أنشئ مستخدمين جدد وعين لهم شركات

## 5. الرابط النهائي:
https://your-app-name.vercel.app