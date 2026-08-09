import { pool } from "./index";
import { auth } from "#/lib/auth";

await pool.query("CREATE SCHEMA IF NOT EXISTS flashcard");
const context = await auth.$context;
await context.runMigrations();
await pool.end();
