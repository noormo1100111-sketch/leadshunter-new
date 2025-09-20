import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run } from './supabase';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): User | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as User;
  } catch {
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<any | null> => {
  const users = await query('SELECT * FROM users WHERE email = $1', [email]);
  return users[0] || null;
};

export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
    [email, hashedPassword, name]
  );
  const users = await query('SELECT * FROM users WHERE id = $1', [result[0].id]);
  return users[0];
};