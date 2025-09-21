import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase'; // استيراد الاتصال المركزي
import { PoolClient } from 'pg';
import { verifyToken } from '@/lib/auth';

// Define types for better code quality and error prevention
interface ApolloFilters {
  locations: string[];
  industries: string[];
  sizes: string[];
}

interface ApolloRequestParams extends ApolloFilters {
  limit?: number;
}

interface Company {
  name: string;
  email: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
}

/**
 * Maps Arabic filter values to English values expected by the Apollo API.
 * @param filters - The filters with Arabic values.
 * @returns The filters with English values.
 */
const mapFiltersToApollo = (
  filters: ApolloFilters
): ApolloFilters => {
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

const fetchCompaniesFromApolloWithFilters = async (
  apiKey: string,
  { locations = [], industries = [], sizes = [], limit = 5 }: ApolloRequestParams
) => {
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
    // 1. التحقق من المصادقة وصلاحيات المدير
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'admin') {
      console.log('❌ محاولة وصول غير مصرح بها إلى simple-sync');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`👤 المستخدم المدير "${user.name}" بدأ عملية المزامنة المتقدمة.`);

    const body = await request.json();
    const {
      locations = ['السعودية'],
      industries = ['البنوك'],
      sizes = ['متوسطة'],
      limit = 5,
    }: ApolloRequestParams & { limit: number } = body;

    const apolloApiKey = process.env.APOLLO_API_KEY;
    if (!apolloApiKey) {
      return NextResponse.json({ error: 'Apollo API key is not configured' }, { status: 500 });
    }

    // Map filters to English values for Apollo
    const apolloFilters = mapFiltersToApollo({ locations, industries, sizes });

    console.log('إعدادات البحث (بعد الترجمة):', { ...apolloFilters, limit });
    
    // إنشاء كائن جديد يتوافق مع النوع المطلوب لحل مشكلة TypeScript
    const requestParams: ApolloRequestParams = {
      ...apolloFilters,
      limit,
    };
    // جلب شركات حقيقية من Apollo مع الفلاتر
    const companies: Company[] = await fetchCompaniesFromApolloWithFilters(apolloApiKey, requestParams);
    console.log('تم جلب', companies.length, 'شركة من Apollo.io');
    
    if (companies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لم يتم العثور على شركات جديدة للمزامنة.',
        imported: 0,
        skipped: 0,
        total: 0,
      });
    }

    const client: PoolClient = await db.connect();
    let imported = 0;
    let skipped = 0;

    try {
      for (const company of companies) {
        // Validate company data before attempting to insert
        if (!company.name || company.name.trim() === '' || company.name === 'Unknown Company') {
          console.log('🟡 تم تخطي شركة - اسم غير صالح:', company.name);
          skipped++;
          continue;
        }

        // Use ON CONFLICT to handle duplicates gracefully and efficiently
        const result = await client.query(
          `INSERT INTO companies (name, email, industry, size, location, status)
           VALUES ($1, $2, $3, $4, $5, 'uncontacted')
           ON CONFLICT (name) DO NOTHING
           RETURNING id`,
          [
            company.name.trim(),
            company.email,
            company.industry,
            company.size,
            company.location,
          ]
        );

        if (result.rowCount > 0) {
          imported++;
          console.log('✅ تمت إضافة الشركة:', company.name, '-> ID:', result.rows[0].id);
        } else {
          skipped++;
          console.log('🟡 الشركة موجودة مسبقاً، تم التخطي:', company.name);
        }
      }
    } finally {
      client.release();
      console.log('🔌 تم تحرير اتصال قاعدة البيانات.');
    }
    
    return NextResponse.json({
      success: true,
      message: `تمت المزامنة بنجاح! تمت إضافة ${imported} شركة جديدة.`,
      imported,
      skipped,
      total: companies.length,
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'فشل في المزامنة',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}