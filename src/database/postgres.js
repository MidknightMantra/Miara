import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function saveSession(data) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS miara_session(id TEXT PRIMARY KEY, creds JSONB);
  `);
  await pool.query(`
    INSERT INTO miara_session (id, creds)
    VALUES ('whatsapp', $1)
    ON CONFLICT (id) DO UPDATE SET creds = EXCLUDED.creds;
  `, [data]);
}

export async function loadSession() {
  const res = await pool.query("SELECT creds FROM miara_session WHERE id='whatsapp'");
  return res.rows[0]?.creds || null;
}
