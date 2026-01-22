const fs = require('fs');
const path = require('path');
const db = require('../src/db');

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, 'schema_update.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema update...');
    await db.query(schemaSql);
    console.log('Schema update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
