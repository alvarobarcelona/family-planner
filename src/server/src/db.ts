import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}

// Detectamos si estamos en producción
const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString,
  // En producción (Render, etc.) usamos SSL, en local no
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});
