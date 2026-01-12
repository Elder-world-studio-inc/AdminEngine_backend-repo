const db = require('./db');
const fs = require('fs');
const path = require('path');

const initDB = async () => {
  try {
    console.log('Initializing Database...');
    
    const migrationPath = path.join(__dirname, '../db/migration_ad_scans.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await db.query(sql);
    console.log('Database Migration Successful: ad_scans table ready.');
  } catch (error) {
    console.error('Database Migration Failed:', error);
  }
};

module.exports = initDB;
