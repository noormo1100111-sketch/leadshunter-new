import { Pool } from 'pg';

const pool = new Pool({
  host: 'db.bwpxsomsllsfukvwusjx.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'As050050@@@@',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

export const query = async (text: string, params: any[] = []): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const run = async (text: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return {
      changes: result.rowCount,
      lastID: result.rows[0]?.id || null
    };
  } finally {
    client.release();
  }
};

export const get = async (text: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Companies table
    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        industry VARCHAR(255),
        size VARCHAR(100),
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'uncontacted',
        assigned_to INTEGER REFERENCES users(id),
        contacted_by INTEGER REFERENCES users(id),
        contacted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin user if not exists
    const adminExists = await get(
      'SELECT id FROM users WHERE email = $1',
      ['admin@leadshunter.com']
    );

    if (!adminExists) {
      await query(`
        INSERT INTO users (email, password, name, role) 
        VALUES ($1, $2, $3, $4)
      `, [
        'admin@leadshunter.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Admin',
        'admin'
      ]);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};