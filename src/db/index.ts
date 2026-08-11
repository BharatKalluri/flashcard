import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseUrl } from "#/lib/env.server";

import * as schema from "./schema";

export const pool = new Pool({
	connectionString: getDatabaseUrl(),
	connectionTimeoutMillis: 10_000,
	onConnect: async (client) => {
		await client.query("CREATE SCHEMA IF NOT EXISTS flashcard");
		await client.query("SET search_path TO flashcard");
	},
});

export const db = drizzle(pool, { schema });
