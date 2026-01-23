const db = require('./db');
const fs = require('fs');
const path = require('path');

const initDB = async () => {
  try {
    console.log('📡 Testing database connection...');
    
    // Test connection first
    const testResult = await db.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    console.log('📊 Running database migration...');
    const migrationPath = path.join(__dirname, '../db/migration_ad_scans.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.log('⚠️  Migration file not found, skipping...');
      return;
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await db.query(sql);
    console.log('✅ Database Migration Successful: ad_scans table ready.');
  } catch (error) {
    console.error('❌ Database Migration Failed:', error.message);
    console.error('📄 Stack:', error.stack);
    throw error; // Re-throw to let caller handle it
  }
};

module.exports = initDB;
