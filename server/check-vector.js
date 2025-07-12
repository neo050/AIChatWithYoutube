import { query, pool } from "./db/index.js";

try {
  const { rows } = await query(
    `SELECT name, default_version, installed_version
     FROM pg_available_extensions
     WHERE name = $1 `
  ,['vector']);
  console.log(rows.length ? rows[0]
                          : 'vector extension is NOT available in this database');
} catch (err) {
  console.error('DB error:', err);
} finally {
  //const res = await query("CREATE EXTENSION IF NOT EXISTS vector;");
  //console.log("pgvector installed!",res);
  await pool.end();
}




