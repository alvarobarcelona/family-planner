import "dotenv/config";
import { Pool, types } from "pg";

// Prevent pg from converting DATE columns (OID 1082) to JS Date objects.
// By default, pg parses DATE → new Date(...) at UTC midnight, which causes
// a -1 day shift for users in UTC+1 (Spain/CET). Returning it as a plain
// string "YYYY-MM-DD" is the safest approach for a date-only field.
types.setTypeParser(1082, (val: string) => val);

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
