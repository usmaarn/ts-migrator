import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

const CONFIG_FILE = path.join(process.cwd(), "migrate.config.json");

interface MigrationConfig {
  databaseUrl: string;
  migrationDir: string;
}

function loadConfig(): MigrationConfig {
  if (fs.existsSync(CONFIG_FILE)) {
    const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return {
      databaseUrl: process.env.DATABASE_URL || fileConfig.databaseUrl,
      migrationDir: fileConfig.migrationDir || "./migrations",
    };
  }

  return {
    databaseUrl: process.env.DATABASE_URL || "",
    migrationDir: "./migrations",
  };
}

export const config = loadConfig();

export const sql = postgres(config.databaseUrl, {
  onnotice: () => {},
});
