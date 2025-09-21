import axios from 'axios';

export interface SmartleadCompany {
  name: string;
  email?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  phone?: string;
}

export const fetchCompaniesFromSmartlead = async (
  limit: number = 50,
  filters?: {
    locations?: string[];
    industries?: string[];
    sizes?: string[];
  }
): Promise<SmartleadCompany[]> => {
  try {
    const apiKey = process.env.SMARTLEAD_API_KEY;
    
    if (!apiKey) {
      console.log('No Smartlead API key, using sample data');
      return getSampleCompanies(limit, filters);
    }

    // Smartlead API endpoint for lead search
    const response = await axios.post('https://server.smartlead.ai/api/v1/leads/search', {
      filters: {
        location: filters?.locations || ['Saudi Arabia', 'UAE', 'Qatar'],
        industry: filters?.industries || ['Technology', 'Finance', 'Healthcare'],
        company_size: filters?.sizes || ['1-50', '51-200', '201-1000'],
        limit: limit
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.leads.map((lead: any) => ({
      name: lead.company_name,
      email: lead.email,
      industry: lead.industry,
      size: lead.company_size,
      location: lead.location,
      website: lead.website,
      phone: lead.phone
    }));

  } catch (error) {
    console.error('Smartlead API error:', error);
    return getSampleCompanies(limit, filters);
  }
};

// بيانات نموذجية في حالة عدم توفر API
const getSampleCompanies = (limit: number, filters?: any): SmartleadCompany[] => {
  const sampleCompanies = [
    { name: 'Saudi Aramco', email: 'info@saudiaramco.com', industry: 'النفط والغاز', size: 'كبيرة', location: 'السعودية', website: 'www.saudiaramco.com', phone: '+966-13-872-7777' },
    { name: 'Emirates NBD', email: 'contactus@emiratesnbd.com', industry: 'البنوك', size: 'متوسطة', location: 'الإمارات', website: 'www.emiratesnbd.com', phone: '+971-600-540000' },
    { name: 'Qatar Airways', email: 'qrinfo@qatarairways.com.qa', industry: 'الطيران', size: 'متوسطة', location: 'قطر', website: 'www.qatarairways.com', phone: '+974-4023-0000' },
    { name: 'STC Saudi Telecom', email: 'info@stc.com.sa', industry: 'الاتصالات', size: 'متوسطة', location: 'السعودية', website: 'www.stc.com.sa', phone: '+966-11-455-0000' },
    { name: 'Almarai Company', email: 'info@almarai.com', industry: 'الأغذية', size: 'متوسطة', location: 'السعودية', website: 'www.almarai.com', phone: '+966-11-479-8888' },
    { name: 'Emaar Properties', email: 'customercare@emaar.ae', industry: 'العقارات', size: 'متوسطة', location: 'الإمارات', website: 'www.emaar.com', phone: '+971-4-367-3333' },
    { name: 'National Bank of Egypt', email: 'info@nbe.com.eg', industry: 'البنوك', size: 'متوسطة', location: 'مصر', website: 'www.nbe.com.eg', phone: '+20-2-2770-8888' },
    { name: 'Zain Group', email: 'info@zain.com', industry: 'الاتصالات', size: 'متوسطة', location: 'الكويت', website: 'www.zain.com', phone: '+965-2259-5959' },
    { name: 'ADNOC Group', email: 'info@adnoc.ae', industry: 'النفط والغاز', size: 'كبيرة', location: 'الإمارات', website: 'www.adnoc.ae', phone: '+971-2-607-4000' },
    { name: 'Majid Al Futtaim', email: 'contactus@maf.ae', industry: 'التجارة', size: 'متوسطة', location: 'الإمارات', website: 'www.majidalfuttaim.com', phone: '+971-4-232-4444' }
  ];

  return sampleCompanies.slice(0, limit);
};