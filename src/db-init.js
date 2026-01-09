const db = require('./db');
const { USERS, SHAREHOLDERS } = require('./data');
const bcrypt = require('bcryptjs');

async function initDB() {
  try {
    console.log('Connecting to database...');
    
    // Create Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        nexus_level INTEGER DEFAULT 1,
        shard_balance INTEGER DEFAULT 0,
        is_elite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Users table ready.');

    // Create Shareholders Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS shareholders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        shares BIGINT NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        email VARCHAR(255),
        grant_date TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Shareholders table ready.');

    // Migrate Initial Data
    for (const user of USERS) {
      const exists = await db.query('SELECT 1 FROM users WHERE username = $1', [user.username]);
      if (exists.rows.length === 0) {
        await db.query(`
          INSERT INTO users (username, email, password_hash, role, nexus_level, shard_balance, is_elite)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [user.username, user.email, user.passwordHash, user.role, user.nexus_level || 1, user.shard_balance || 0, user.is_elite || false]);
        console.log(`Migrated user: ${user.username}`);
      }
    }

    for (const sh of SHAREHOLDERS) {
        const exists = await db.query('SELECT 1 FROM shareholders WHERE name = $1', [sh.name]);
        if (exists.rows.length === 0) {
            await db.query(`
                INSERT INTO shareholders (name, type, shares, percentage, email)
                VALUES ($1, $2, $3, $4, $5)
            `, [sh.name, sh.type, sh.shares, sh.percentage, sh.email]);
            console.log(`Migrated shareholder: ${sh.name}`);
        }
    }

    console.log('Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

initDB();
