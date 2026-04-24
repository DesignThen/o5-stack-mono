import { MigrationFunctionReference, Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

export const migrations = new Migrations<DataModel>(components.migrations);

/** Run all migrations in order. */
const allMigrations: MigrationFunctionReference[] = [];

export const runAll =
  allMigrations.length > 0
    ? migrations.runner(allMigrations)
    : internalMutation({ args: {}, handler: async () => {} });
