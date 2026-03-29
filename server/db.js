const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

pool.on('connect', () => {
  console.log('Connected to Postgres');
});

pool.on('error', (err) => {
  console.error('Postgres error:', err);
});

module.exports = pool;