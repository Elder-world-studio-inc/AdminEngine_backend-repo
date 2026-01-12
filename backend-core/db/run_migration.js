const fs = require('fs');
const path = require('path');
const db = require('../src/db');

async function migrateInteractive() {
  try {
    const schemaPath = path.join(__dirname, 'migration_interactive.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running Interactive migration...');
    await db.query(schemaSql);
    console.log('Interactive migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateInteractive();
