import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "change-me", // FIXME:
    expiresIn: "3d" as const,
  },
  bcrypt: {
    saltRounds: 10,
  },
  google: {
    geocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY,
  },
  cors: {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  },
};
