import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import { v4 as randomUUID } from "uuid";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production" ||
    (process.env.DATABASE_URL &&
      !process.env.DATABASE_URL.includes("localhost"))
      ? { rejectUnauthorized: false }
      : false,
});

async function createHousehold(name: string, password: string) {
  try {
    console.log(`Creating household: "${name}"...`);

    // 1. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const id = randomUUID();

    // 2. Insert into DB
    const res = await pool.query(
      `INSERT INTO households (id, name, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      [id, name, passwordHash]
    );

    console.log("✅ Household created successfully!");
    console.log(`ID: ${res.rows[0].id}`);
    console.log(`Name: ${name}`);
    console.log(`Password: (hashed)`);
  } catch (err: any) {
    if (err.code === "23505") {
      console.error("❌ Error: A household with this name already exists.");
    } else {
      console.error("❌ Error creating household:", err);
    }
  } finally {
    await pool.end();
  }
}

// Get args
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(
    "Usage: npx ts-node src/server/scripts/create_household.ts <NAME> <PASSWORD>"
  );
  process.exit(1);
}

const [name, password] = args;
createHousehold(name, password);
