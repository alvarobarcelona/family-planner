import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}

// Detectamos si estamos en producción
const isProduction = process.env.NODE_ENV === "production";
const isRemote = connectionString?.includes("localhost") === false;

export const pool = new Pool({
  connectionString,
  // Force SSL if remote or production
  ssl: isProduction || isRemote ? { rejectUnauthorized: false } : undefined,
});
