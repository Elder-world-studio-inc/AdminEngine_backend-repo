const fs = require('fs');
const path = require('path');
const db = require('../src/db');

async function migrateOrg() {
  try {
    const schemaPath = path.join(__dirname, 'migration_org_structure.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running Org Structure migration...');
    await db.query(schemaSql);
    console.log('Org Structure migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateOrg();
