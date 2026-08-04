import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

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

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}
