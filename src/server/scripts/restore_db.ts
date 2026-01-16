import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import * as zlib from "zlib";

// Load env
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const backupFile = process.argv[2];

if (!backupFile) {
  console.error(
    "Usage: npx ts-node src/server/scripts/restore_db.ts <BACKUP_FILE_PATH>"
  );
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL is not defined in .env");
  process.exit(1);
}

async function restore() {
  console.log(`➡️  Restoring from: ${backupFile}`);

  // 1. Decompress if .gz
  let fileToRestore = backupFile;
  let isTempFile = false;

  if (backupFile.endsWith(".gz")) {
    console.log("📦 Decompressing backup...");
    const gunzip = zlib.createGunzip();
    const source = fs.createReadStream(backupFile);
    fileToRestore = backupFile.replace(".gz", "");
    const destination = fs.createWriteStream(fileToRestore);

    await new Promise<void>((resolve, reject) => {
      source.pipe(gunzip).pipe(destination);
      destination.on("finish", resolve);
      destination.on("error", reject);
    });
    isTempFile = true;
    console.log("✅ Decompressed.");
  }

  // 2. Restore
  console.log("🔄 Restoring database...");
  try {
    // Determine command based on OS (assuming psql is in PATH)
    // We use psql with connection string
    // Warning: Providing password via env var usually usually required for psql

    // We can use execSync with stdio inherit to show output
    // But psql needs pg_restore or just psql < file depending on format
    // reliable way: psql "postgres://..." -f file

    execSync(`psql "${dbUrl}" -f "${fileToRestore}"`, { stdio: "inherit" });

    console.log("✅ Database restored successfully!");
  } catch (err) {
    console.error("❌ Error restoring database:", err);
  } finally {
    // Cleanup temp file
    if (isTempFile && fs.existsSync(fileToRestore)) {
      fs.unlinkSync(fileToRestore);
    }
  }
}

restore();
