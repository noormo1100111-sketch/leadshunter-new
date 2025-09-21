// LinkedIn Official API (محدود - للشركات المعتمدة فقط)
export const fetchLinkedInCompanies = async (accessToken: string) => {
  try {
    // LinkedIn API محدود جداً ولا يسمح بالبحث عن الشركات للمطورين العاديين
    const response = await fetch('https://api.linkedin.com/v2/organizations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('LinkedIn API Error:', error);
    return null;
  }
};

// بديل: استخدام LinkedIn Sales Navigator (يدوي)
export const linkedInSalesNavigatorGuide = {
  steps: [
    "1. اشترك في LinkedIn Sales Navigator",
    "2. استخدم البحث المتقدم للشركات",
    "3. فلتر بالموقع: السعودية",
    "4. فلتر بالصناعة المطلوبة", 
    "5. فلتر بحجم الشركة",
    "6. صدر النتائج إلى CSV",
    "7. ارفع الملف في النظام"
  ],
  pricing: "من $79.99/شهر",
  features: [
    "25 InMail شهرياً",
    "بحث متقدم غير محدود",
    "تصدير قوائم الشركات",
    "معلومات اتصال دقيقة"
  ]
};