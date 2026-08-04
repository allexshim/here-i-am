import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type JwtPayload = {
  userId: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, config.jwt.secret);
  if (
    typeof decoded !== "object" ||
    decoded == null ||
    !("userId" in decoded)
  ) {
    throw new Error("Invalid token payload");
  }
  return { userId: decoded.userId };
}
