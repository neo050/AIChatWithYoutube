import { query, pool } from "./db/index.js";
export const listVideos = async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * from transcript;");
    res.json(rows);
  } catch (err) {
    next(err);
  }
};



const sql = `
  SELECT table_schema, table_name
  FROM   information_schema.tables
  WHERE  table_type = 'BASE TABLE'
    AND  table_schema NOT IN ('pg_catalog', 'information_schema')
  ORDER  BY table_schema, table_name;
`;

try {
  const { rows } = await query(sql);
 
  console.table(rows);         
console.table(  await query("SELECT * from transcript;"));  
} finally {
  await pool.end();
}
