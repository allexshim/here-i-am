import type { Request, Response } from "express";
import * as userRepository from "../repository/user.js";
import { signToken } from "../lib/jwt.js";
import { getPasswordHash, isValidPassword } from "../lib/bcrypt.js";

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);
}

export async function signup(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Invalid Email." });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res
      .status(400)
      .json({ massage: "Password must be at least 8 characters." });
    return;
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    res.status(400).json({ message: "Duplicated Email." });
    return;
  }

  const passwordHash = await getPasswordHash(password);
  const user = await userRepository.create({ email, passwordHash });
  const token = signToken({ userId: user.id });

  res.status(201).json({
    token,
    user: { id: user.id, shareCode: user.shareCode, email: user.email },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    res.status(401).json({ message: "Invalid Email." });
    return;
  }

  const matches = await isValidPassword(password, user.passwordHash);
  if (!matches) {
    res.status(401).json({ message: "Invalid Password." });
    return;
  }

  const token = signToken({ userId: user.id });
  res.status(200).json({
    token,
    user: { id: user.id, shareCode: user.shareCode, email: user.email },
  });
}
