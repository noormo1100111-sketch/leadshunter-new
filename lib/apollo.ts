import axios from 'axios';

export interface ApolloCompany {
  name: string;
  email?: string;
  industry?: string;
  size?: string;
  location?: string;
}

// شركات الشرق الأوسط الحقيقية
const realCompanies = [
  { name: 'Saudi Aramco', industry: 'Oil & Gas', location: 'Dhahran, Saudi Arabia', size: '50000+' },
  { name: 'Emirates NBD', industry: 'Banking', location: 'Dubai, UAE', size: '10000-50000' },
  { name: 'STC Saudi Telecom', industry: 'Telecommunications', location: 'Riyadh, Saudi Arabia', size: '10000-50000' },
  { name: 'Talaat Moustafa Group', industry: 'Real Estate', location: 'Cairo, Egypt', size: '5000-10000' },
  { name: 'Zain Telecom', industry: 'Telecommunications', location: 'Kuwait City, Kuwait', size: '5000-10000' },
  { name: 'Qatar National Bank', industry: 'Banking', location: 'Doha, Qatar', size: '10000-50000' },
  { name: 'Almarai Company', industry: 'Food & Beverages', location: 'Riyadh, Saudi Arabia', size: '1000-5000' },
  { name: 'Emaar Properties', industry: 'Real Estate', location: 'Dubai, UAE', size: '5000-10000' },
  { name: 'Orascom Construction', industry: 'Construction', location: 'Cairo, Egypt', size: '10000-50000' },
  { name: 'National Bank of Egypt', industry: 'Banking', location: 'Cairo, Egypt', size: '10000-50000' },
  { name: 'Gulf Petrochemical Industries', industry: 'Petrochemicals', location: 'Kuwait City, Kuwait', size: '1000-5000' },
  { name: 'Majid Al Futtaim Group', industry: 'Retail & Entertainment', location: 'Dubai, UAE', size: '5000-10000' },
  { name: 'Savola Group', industry: 'Food & Agriculture', location: 'Jeddah, Saudi Arabia', size: '5000-10000' },
  { name: 'Bank Audi', industry: 'Banking', location: 'Beirut, Lebanon', size: '1000-5000' },
  { name: 'Qatar Airways', industry: 'Aviation', location: 'Doha, Qatar', size: '10000-50000' },
  { name: 'Al Othaim Group', industry: 'Retail & Investment', location: 'Riyadh, Saudi Arabia', size: '5000-10000' },
  { name: 'Dar Al Arkan', industry: 'Real Estate', location: 'Riyadh, Saudi Arabia', size: '1000-5000' },
  { name: 'National Bank of Kuwait', industry: 'Banking', location: 'Kuwait City, Kuwait', size: '5000-10000' },
  { name: 'Etihad Airways', industry: 'Aviation', location: 'Abu Dhabi, UAE', size: '5000-10000' },
  { name: 'Al Hokair Group', industry: 'Entertainment & Hospitality', location: 'Riyadh, Saudi Arabia', size: '1000-5000' },
  { name: 'ADNOC Group', industry: 'Oil & Gas', location: 'Abu Dhabi, UAE', size: '50000+' },
  { name: 'Commercial Bank of Dubai', industry: 'Banking', location: 'Dubai, UAE', size: '1000-5000' },
  { name: 'Mobily Telecom', industry: 'Telecommunications', location: 'Riyadh, Saudi Arabia', size: '5000-10000' },
  { name: 'Egyptian Steel', industry: 'Manufacturing', location: 'Cairo, Egypt', size: '1000-5000' },
  { name: 'Agility Logistics', industry: 'Logistics', location: 'Kuwait City, Kuwait', size: '10000-50000' }
];

let currentIndex = 0;

export const fetchCompaniesFromApollo = async (limit: number = 50): Promise<ApolloCompany[]> => {
  // محاكاة تأخير API
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const companies = [];
  const batchSize = Math.min(limit, 10);
  
  for (let i = 0; i < batchSize; i++) {
    const company = realCompanies[currentIndex % realCompanies.length];
    const suffix = Math.floor(currentIndex / realCompanies.length) > 0 ? ` ${Math.floor(currentIndex / realCompanies.length) + 1}` : '';
    
    companies.push({
      name: company.name + suffix,
      email: `contact@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      industry: company.industry,
      size: company.size,
      location: company.location
    });
    currentIndex++;
  }
  
  return companies;
};