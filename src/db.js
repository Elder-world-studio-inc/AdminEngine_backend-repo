const { Pool } = require('pg');
require('dotenv').config();

const config = {
  connectionString: process.env.DATABASE_URL,
};

// Enable SSL unless explicitly disabled
if (process.env.DB_SSL !== 'false') {
  config.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(config);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
