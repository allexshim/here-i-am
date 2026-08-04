import { customAlphabet } from "nanoid";
import { query } from "../db/database.js";

const NANOID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export type User = {
  id: string;
  shareCode: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type UserRow = {
  id: string;
  share_code: string;
  email: string;
  password_hash: string;
  created_at: string;
};

function rowToUser(row: UserRow): User {
  return {
    ...row,
    shareCode: row.share_code,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function create({
  email,
  passwordHash,
}: {
  email: string;
  passwordHash: string;
}): Promise<User> {
  const id = customAlphabet(NANOID_ALPHABET, 12);
  const shareCode = customAlphabet(NANOID_ALPHABET, 8);
  const result = await query<UserRow>(
    `
    INSERT INTO users (id, share_code, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `,
    [id, shareCode, email, passwordHash],
  );
  return rowToUser(result.rows[0]);
}

export async function findByEmail(email: string): Promise<User | undefined> {
  const result = await query<UserRow>("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const row = result.rows[0];
  return row ? rowToUser(row) : undefined;
}

export async function findByShareCode(
  shareCode: string,
): Promise<User | undefined> {
  const result = await query<UserRow>(
    "SELECT * FROM users WHERE share_code = $1",
    [shareCode],
  );
  const row = result.rows[0];
  return row ? rowToUser(row) : undefined;
}
