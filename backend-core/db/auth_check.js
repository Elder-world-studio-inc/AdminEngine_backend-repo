const { Client } = require('pg');

const projectRef = 'pxuzibdxqjrgfjbltsnv';
const poolerHost = 'aws-0-us-west-2.pooler.supabase.com';

const combinations = [
  { user: `postgres.${projectRef}`, password: 'Wilson@2077', desc: 'Provided Password' },
  { user: `postgres.${projectRef}`, password: 'Wilson@20776612', desc: 'Old Password found in .env' },
  { user: `postgres`, password: 'Wilson@2077', desc: 'Direct User / Provided Password' },
];

async function testConnection(config) {
  const client = new Client({
    host: poolerHost,
    port: 5432,
    user: config.user,
    password: config.password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log(`Testing: ${config.desc} (User: ${config.user}, Pass: ${config.password})`);
    await client.connect();
    console.log('✅ SUCCESS! Connected.');
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    await client.end();
    return false;
  }
}

async function runDiagnostics() {
  console.log('--- Starting Auth Diagnostics ---');
  let success = false;
  for (const combo of combinations) {
    if (await testConnection(combo)) {
        success = true;
        break;
    }
    console.log('---');
  }
  
  if (!success) {
      console.log('\nAll attempts failed. Please verify your password on Supabase Dashboard.');
  }
}

runDiagnostics();
