import { Pool } from 'pg';

const env = process.env.NODE_ENV || 'development';
let dbconfig;

if (env === 'test') {
  dbconfig = {
    host: process.env.TEST_PG_HOST,
    port: process.env.TEST_PG_PORT,
    user: process.env.TEST_PG_USER,
    password: process.env.TEST_PG_PASSWORD,
    database: process.env.TEST_PG_DATABASE,
  }
}
else if (env === 'development') {
  dbconfig = {
    host: process.env.DEV_PG_HOST,
    port: process.env.DEV_PG_PORT,
    user: process.env.DEV_PG_USER,
    password: process.env.DEV_PG_PASSWORD,
    database: process.env.DEV_PG_DATABASE,
  }
}
else if (env === 'production' && process.env.DATABASE_URL) {
  // Production db
  dbconfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }
}

export const pool = new Pool(dbconfig);
