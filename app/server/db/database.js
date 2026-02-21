import { Pool } from "pg";
import { config } from "../config.js";

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: config.db.host,
      user: config.db.user,
      database: config.db.name,
      password: config.db.password,
      port: config.db.port,
    });

export async function query(text, params = []) {
  const res = await pool.query(text, params);
  return res;
}
