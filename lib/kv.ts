import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  industry?: string;
  size?: string;
  location?: string;
  status: string;
  assigned_to?: string;
  contacted_by?: string;
  contacted_at?: string;
  created_at: string;
}

export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const id = Date.now().toString();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Check if first user - make admin
  const userCount = await kv.get('user_count') || 0;
  const role = userCount === 0 ? 'admin' : 'user';
  
  const user: User = {
    id,
    email,
    password: hashedPassword,
    name,
    role,
    created_at: new Date().toISOString()
  };
  
  await kv.set(`user:${id}`, user);
  await kv.set(`user_email:${email}`, id);
  await kv.incr('user_count');
  
  return user;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const userId = await kv.get(`user_email:${email}`);
  if (!userId) return null;
  
  return await kv.get(`user:${userId}`);
};

export const createCompany = async (companyData: Omit<Company, 'id' | 'created_at'>): Promise<Company> => {
  const id = Date.now().toString();
  const company: Company = {
    ...companyData,
    id,
    created_at: new Date().toISOString()
  };
  
  await kv.set(`company:${id}`, company);
  await kv.sadd('companies', id);
  
  return company;
};

export const getCompanies = async (): Promise<Company[]> => {
  const companyIds = await kv.smembers('companies');
  const companies = [];
  
  for (const id of companyIds) {
    const company = await kv.get(`company:${id}`);
    if (company) companies.push(company);
  }
  
  return companies;
};