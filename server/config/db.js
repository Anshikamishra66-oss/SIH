const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

const connectDB = async () => {
  try {
    const { registry } = require('../utils/postgresModel');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        collection TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS documents_collection_idx ON documents (collection)');

    for (const model of registry.values()) await model.ensureTable();

    const { rows: legacyDocuments } = await pool.query('SELECT collection, data FROM documents');
    for (const legacyDocument of legacyDocuments) {
      const model = registry.get(legacyDocument.collection);
      if (model) await model._write(model._document(legacyDocument.data));
    }

    await pool.query('DROP TABLE IF EXISTS documents');

    await pool.query('DROP TABLE IF EXISTS documents');

    console.log(`✅ PostgreSQL connected to ${process.env.PGDATABASE || 'configured database'}`);
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    process.exit(1);
  }
};

const closeDB = async () => {
  await pool.end();
};

module.exports = { connectDB, closeDB, pool };
