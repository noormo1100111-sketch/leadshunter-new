import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase'; // استيراد الاتصال المركزي

/**
 * Maps Arabic filter values to English values expected by the Apollo API.
 * @param filters - The filters with Arabic values.
 * @returns The filters with English values.
 */
const mapFiltersToApollo = (filters: { locations: string[], industries: string[], sizes: string[] }) => {
  const locationMap: { [key: string]: string } = {
    'السعودية': 'saudi arabia',
    'الإمارات': 'united arab emirates',
    'مصر': 'egypt',
  };
  const industryMap: { [key: string]: string } = {
    'البنوك': 'banking',
    'التقنية': 'information technology and services',
    'العقارات': 'real estate',
  };
  const sizeMap: { [key: string]: string } = {
    'صغيرة': '1,10',
    'متوسطة': '11,50',
    'كبيرة': '51,200',
  };

  return {
    locations: filters.locations.map(loc => locationMap[loc] || loc),
    industries: filters.industries.map(ind => industryMap[ind] || ind),
    sizes: filters.sizes.map(s => sizeMap[s] || s),
  };
};

const fetchCompaniesFromApolloWithFilters = async (apiKey: string, { locations = [], industries = [], sizes = [], limit = 5 }) => {
  if (!apiKey) {
    throw new Error('Apollo API key is missing.');
  }

  const response = await fetch('https://api.apollo.io/v1/organizations/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      api_key: apiKey,
      organization_locations: locations,
      organization_industries: industries,
      organization_num_employees_ranges: sizes,
      // Use a random page to get different results each time
      page: Math.floor(Math.random() * 10) + 1,
      per_page: limit,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apollo API request failed with status ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.organizations.map((org: any) => ({
    name: org.name || 'Unknown Company',
    email: org.email || null,
    industry: org.industry || null,
    size: org.employees_range || null,
    location: org.country || org.city || null,
  }));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations = ['السعودية'], industries = ['البنوك'], sizes = ['متوسطة'], limit = 5 } = body;

    const apolloApiKey = process.env.APOLLO_API_KEY;
    if (!apolloApiKey) {
      return NextResponse.json({ error: 'Apollo API key is not configured' }, { status: 500 });
    }

    // Map filters to English values for Apollo
    const apolloFilters = mapFiltersToApollo({ locations, industries, sizes });

    console.log('إعدادات البحث (بعد الترجمة):', { ...apolloFilters, limit });
    
    // جلب شركات حقيقية من Apollo مع الفلاتر
    const companies = await fetchCompaniesFromApolloWithFilters(apolloApiKey, { ...apolloFilters, limit });
    console.log('تم جلب', companies.length, 'شركة من Apollo.io');
    
    const client = await db.connect();
    let imported = 0;
    
    for (const company of companies) {
      try {
        if (!company.name || company.name.trim() === '' || company.name === 'Unknown Company') {
          console.log('تم تخطي شركة بدون اسم صالح.');
          continue;
        }

        const result = await client.query(
          'INSERT INTO companies (name, email, industry, size, location, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id',
          [company.name.trim(), company.email, company.industry, company.size, company.location, 'uncontacted']
        );

        if (result.rows.length > 0) {
          imported++;
          console.log('Added company:', company.name, 'ID:', result.rows[0].id);
        }
      } catch (insertError) {
        if (insertError instanceof Error && 'code' in insertError && insertError.code === '23505') { // Unique violation
          console.log('Company already exists:', company.name);
        } else {
          console.error(`فشل في إضافة الشركة ${company.name}:`, insertError);
        }
      }
    }
    
    client.release();
    
    return NextResponse.json({
      success: true,
      message: `تمت المزامنة بنجاح! تمت إضافة ${imported} شركة جديدة.`,
      imported,
      total: companies.length
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'فشل في المزامنة',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}