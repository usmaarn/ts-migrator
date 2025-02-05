import { Command } from "commander";
import { migrateUp, migrateDown, showMigrationStatus, createMigrationFile, initMigrationsTable } from "./migrate";

const program = new Command();

program.command("init").description("Initialize migrations table").action(initMigrationsTable);
program
  .command("up")
  .description("Run pending migrations")
  .option("--dry-run", "Preview only")
  .action((opts) => migrateUp(opts.dryRun));
program
  .command("down")
  .description("Rollback migration")
  .option("--all", "Rollback all")
  .option("--dry-run", "Preview only")
  .action((opts) => migrateDown(opts.all, opts.dryRun));
program.command("create <name>").description("Create a new migration file").action(createMigrationFile);
program.command("status").description("Show migration status").action(showMigrationStatus);

program.parse(process.argv);
