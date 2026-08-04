import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

const BEARER_PREFIX = "Bearer ";

export function requiredAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
