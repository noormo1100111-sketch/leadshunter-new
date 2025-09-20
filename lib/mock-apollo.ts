// بيانات وهمية للاختبار بدلاً من Apollo.io API
export const mockCompanies = [
  {
    name: "شركة التقنية المتقدمة",
    email: "info@techadvanced.com",
    industry: "تكنولوجيا المعلومات",
    size: "50-100",
    location: "الرياض، السعودية"
  },
  {
    name: "مؤسسة الابتكار الرقمي",
    email: "contact@digitalinnovation.com", 
    industry: "التسويق الرقمي",
    size: "10-50",
    location: "دبي، الإمارات"
  },
  {
    name: "شركة الحلول الذكية",
    email: "hello@smartsolutions.com",
    industry: "الذكاء الاصطناعي",
    size: "100-500",
    location: "القاهرة، مصر"
  },
  {
    name: "مجموعة التجارة الإلكترونية",
    email: "support@ecommercegroup.com",
    industry: "التجارة الإلكترونية", 
    size: "200-1000",
    location: "الكويت، الكويت"
  },
  {
    name: "شركة الاستشارات التقنية",
    email: "info@techconsulting.com",
    industry: "الاستشارات",
    size: "20-50", 
    location: "عمان، الأردن"
  }
];

let mockIndex = 0;

export const fetchMockCompanies = async (limit: number = 50) => {
  // محاكاة تأخير API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // إنشاء شركات جديدة في كل مرة
  const newCompanies = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    const baseCompany = mockCompanies[i % mockCompanies.length];
    newCompanies.push({
      ...baseCompany,
      name: `${baseCompany.name} ${mockIndex + i + 1}`,
      email: `info${mockIndex + i + 1}@${baseCompany.email.split('@')[1]}`
    });
  }
  
  mockIndex += 5;
  return newCompanies;
};