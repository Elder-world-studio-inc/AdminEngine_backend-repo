const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.pxuzibdxqjrgfjbltsnv',
  password: 'Alishaa@949##@@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

console.log('Testing connection with:');
console.log('Host: aws-0-us-west-2.pooler.supabase.com');
console.log('User: postgres.pxuzibdxqjrgfjbltsnv');
console.log('Password: Alishaa@949##@@');

client.connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('❌ Connection error:', err);
    client.end();
  });
