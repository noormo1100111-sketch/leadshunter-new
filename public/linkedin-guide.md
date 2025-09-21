# دليل استخراج الشركات من LinkedIn

## الطريقة الرسمية (LinkedIn Sales Navigator):

### 1. الاشتراك:
- اذهب إلى: https://business.linkedin.com/sales-solutions/sales-navigator
- اشترك في الخطة الأساسية ($79.99/شهر)
- أو جرب النسخة التجريبية المجانية (30 يوم)

### 2. البحث المتقدم:
1. اذهب إلى "Companies" في Sales Navigator
2. استخدم الفلاتر:
   - **Location**: Saudi Arabia, UAE, Qatar, etc.
   - **Industry**: Technology, Banking, Healthcare, etc.
   - **Company Size**: 1-10, 11-50, 51-200, etc.
   - **Company Type**: Public, Private, etc.

### 3. التصدير:
1. حدد الشركات المطلوبة
2. اضغط "Save to list"
3. اذهب إلى "Saved Lists"
4. اضغط "Export" → CSV

### 4. رفع البيانات:
1. ارجع للنظام
2. اضغط "رفع CSV"
3. ارفع الملف المُصدر من LinkedIn

## الطريقة البديلة (مجانية):

### استخدام LinkedIn Search:
1. ابحث عن: `"company" site:linkedin.com/company location:saudi-arabia`
2. استخدم أدوات Web Scraping مثل:
   - **Octoparse** (مجاني جزئياً)
   - **ParseHub** (مجاني جزئياً)
   - **Chrome Extensions** مثل Data Miner

### أدوات Chrome Extensions:
- **LinkedIn Helper**: استخراج معلومات الشركات
- **Data Miner**: استخراج بيانات من أي صفحة
- **Web Scraper**: أداة مجانية للاستخراج

## تنسيق الملف المطلوب:
```csv
name,email,industry,size,location,website,phone
"Saudi Aramco","info@saudiaramco.com","Oil & Gas","Large","Saudi Arabia","www.saudiaramco.com","+966-13-872-7777"
```

## نصائح مهمة:
- **احترم شروط الاستخدام** لـ LinkedIn
- **لا تفرط في الاستخراج** لتجنب الحظر
- **تحقق من دقة البيانات** قبل الرفع
- **استخدم VPN** إذا لزم الأمر