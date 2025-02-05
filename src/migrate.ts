import { config, sql } from "./config.ts";
import fs from "fs";
import path from "path";

const MIGRATION_DIR = path.resolve(config.migrationDir);

async function getAppliedMigrations(): Promise<string[]> {
  const rows = await sql<{ name: string }[]>`SELECT name FROM migrations`;
  return rows.map((row) => row.name);
}

async function runMigration(file: string, direction: "up" | "down", dryRun: boolean) {
  const filePath = path.join(MIGRATION_DIR, file);
  const sqlStatements = fs.readFileSync(filePath, "utf8").split("-- Down");

  const query = direction === "up" ? sqlStatements[0] : sqlStatements[1];
  if (!query) {
    console.log(`⚠️ No ${direction} query found in ${file}`);
    return;
  }

  console.log(`🚀 ${dryRun ? "[DRY RUN] " : ""}Running ${direction} migration: ${file}`);
  console.log(query.trim() + "\n");

  if (!dryRun) {
    await sql.unsafe(query);
    if (direction === "up") {
      await sql`INSERT INTO migrations (name) VALUES (${file})`;
    } else {
      await sql`DELETE FROM migrations WHERE name = ${file}`;
    }
  }
}

export async function migrateUp(dryRun = false) {
  const applied = await getAppliedMigrations();
  const files = fs.readdirSync(MIGRATION_DIR).filter((f) => f.endsWith(".sql"));

  for (const file of files) {
    if (!applied.includes(file)) {
      await runMigration(file, "up", dryRun);
    }
  }
}

export async function migrateDown(all = false, dryRun = false) {
  const applied = await getAppliedMigrations();
  if (applied.length === 0) {
    console.log("❌ No migrations to roll back.");
    return;
  }

  const migrationsToRollback = all ? applied : [applied[applied.length - 1]];

  for (const file of migrationsToRollback.reverse()) {
    await runMigration(file, "down", dryRun);
  }
}

export async function showMigrationStatus() {
  const appliedMigrations = await sql<{ name: string }[]>`SELECT name FROM migrations`;
  const appliedNames = new Set(appliedMigrations.map((m) => m.name));

  const allFiles = fs.readdirSync(MIGRATION_DIR).filter((f) => f.endsWith(".sql"));

  console.log("\n📜 Migration Status\n---------------------------");
  allFiles.forEach((file) => {
    const status = appliedNames.has(file) ? "✅ APPLIED" : "❌ PENDING";
    console.log(`${status} - ${file}`);
  });

  console.log("---------------------------\n");
}

export function createMigrationFile(name: string) {
  if (!fs.existsSync(MIGRATION_DIR)) {
    fs.mkdirSync(MIGRATION_DIR);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
  const filename = `${timestamp}_${name}.sql`;
  const filePath = path.join(MIGRATION_DIR, filename);

  const template = `-- Up\n\n-- Down\n`;
  fs.writeFileSync(filePath, template);

  console.log(`✅ Migration created: ${filename}`);
}

export async function initMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT now()
    );
  `;
  console.log("✅ Migrations table is ready.");
}
