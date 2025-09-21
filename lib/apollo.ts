// lib/apollo.ts

interface Company {
  name: string;
  email: string;
  industry: string;
  size: string;
  location: string;
}

/**
 * Fetches company data from the Apollo.io API.
 * @param apiKey - Your Apollo.io API key.
 * @param limit - The number of companies to fetch.
 * @returns A promise that resolves to an array of companies.
 */
export const fetchCompaniesFromApollo = async (apiKey: string, limit: number = 10): Promise<Company[]> => {
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
      q_organization_name: "saudi arabia", // Example search query
      page: 1,
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