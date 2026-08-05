import bcrypt from "bcryptjs";
import { config } from "../config.js";

export async function getPasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, config.bcrypt.saltRounds);
}

export async function isValidPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}
