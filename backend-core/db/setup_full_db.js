const fs = require('fs');
const path = require('path');
const db = require('../src/db');

async function runSqlFile(filename) {
  try {
    const schemaPath = path.join(__dirname, filename);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`Running ${filename}...`);
    await db.query(schemaSql);
    console.log(`${filename} completed.`);
  } catch (err) {
    if (err.code === '42P07') {
      console.warn(`⚠️  Notice for ${filename}: Table/Relation already exists. Skipping...`);
    } else {
      console.error(`Failed to run ${filename}:`, err);
      throw err;
    }
  }
}

async function runSeed() {
  try {
    console.log('Running seed...');
    // We can require the seed function from seed.js if it exports it, 
    // but seed.js executes on load (it calls migrate() at the end? No, it calls seed() at the end).
    // Actually seed.js calls seed() at the end: seed();
    // So if we require it, it might run automatically or we might need to modify seed.js to export.
    // To avoid modifying seed.js too much, let's just spawn it or copy the logic.
    // Spawning is safer to isolate context.
    
    const { execSync } = require('child_process');
    // Using execSync to run the seed script
    execSync('node db/seed.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('Seed completed.');
  } catch (err) {
    console.error('Seed failed:', err);
    throw err;
  }
}

async function setup() {
  try {
    console.log('Starting Full Database Setup...');

    // 0. Drop all tables to ensure a fresh start (optional, but requested by user)
    console.log('Cleaning up old tables...');
    await db.query(`
      DROP TABLE IF EXISTS ad_scans CASCADE;
      DROP TABLE IF EXISTS contracts CASCADE;
      DROP TABLE IF EXISTS receipts CASCADE;
      DROP TABLE IF EXISTS royalty_streams CASCADE;
      DROP TABLE IF EXISTS assets CASCADE;
      DROP TABLE IF EXISTS budget_items CASCADE;
      DROP TABLE IF EXISTS cap_table_meta CASCADE;
      DROP TABLE IF EXISTS kpi_stats CASCADE;
      DROP TABLE IF EXISTS divisions CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS shareholders CASCADE;
      DROP TABLE IF EXISTS interactive_projects CASCADE;
      DROP TABLE IF EXISTS interactive_vault_assets CASCADE;
      DROP TABLE IF EXISTS interactive_assets CASCADE;
      DROP TABLE IF EXISTS omnivael_library CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('Cleanup complete.');

    // 1. Base Users Table
    await runSqlFile('schema.sql');

    // 1.5 Fix missing columns if schema already existed but was old
    await runSqlFile('migration_fix_users.sql');

    // 2. Other Tables (kpi, assets, etc.)
    await runSqlFile('schema_update.sql');

    // 3. Org Structure (divisions, roles)
    await runSqlFile('migration_org_structure.sql');
    
    // 4. Seed Data (Must run before interactive migration updates)
    await runSeed();

    // 5. Interactive Division Updates (alters users table and updates data)
    await runSqlFile('migration_interactive.sql');

    // 6. Ad Scans (new feature)
    await runSqlFile('migration_ad_scans.sql');

    console.log('Full Database Setup Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database Setup Failed:', err);
    process.exit(1);
  }
}

setup();
