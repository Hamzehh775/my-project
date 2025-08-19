import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Users service connected to PostgreSQL');
    await client.query("SET statement_timeout = '5s'");
  } catch (err) {
    console.error('❌ DB connection error (Users service):', err.message);
    process.exit(1);
  }
}

export { client, connectDB };
