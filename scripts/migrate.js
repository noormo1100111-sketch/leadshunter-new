const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function migrate() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Companies table
      db.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          email TEXT,
          industry TEXT,
          size TEXT,
          location TEXT,
          status TEXT DEFAULT 'uncontacted',
          assigned_to INTEGER,
          contacted_by INTEGER,
          contacted_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users (id),
          FOREIGN KEY (contacted_by) REFERENCES users (id)
        )
      `);

      // Create admin user if not exists
      const hashedPassword = bcrypt.hashSync('password', 10);
      db.run(`
        INSERT OR IGNORE INTO users (email, password, name, role) 
        VALUES ('admin@leadshunter.com', ?, 'Admin', 'admin')
      `, [hashedPassword], (err) => {
        if (err) {
          console.error('Migration failed:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          console.log('Admin user created: admin@leadshunter.com / password');
          db.close();
          resolve();
        }
      });
    });
  });
}

migrate().then(() => process.exit(0)).catch(() => process.exit(1));