import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  return POST();
}

export async function POST() {
  const apiKey = process.env.APOLLO_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      success: false,
      error: 'API key not found'
    });
  }

  // Test different endpoints to find what's available
  const testEndpoints = [
    'https://api.apollo.io/v1/auth/health',
    'https://api.apollo.io/v1/organizations/search',
    'https://api.apollo.io/v1/people/search',
    'https://api.apollo.io/v1/mixed_people/search'
  ];

  const results = [];
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await axios.get(endpoint, {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        params: endpoint.includes('search') ? { per_page: 1 } : undefined
      });
      
      results.push({
        endpoint,
        status: 'success',
        statusCode: response.status,
        data: response.data
      });
      
    } catch (error: any) {
      results.push({
        endpoint,
        status: 'error',
        statusCode: error.response?.status,
        error: error.response?.data || error.message
      });
    }
  }
  
  return NextResponse.json({ results });
}