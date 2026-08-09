import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseUrl, serverEnv } from "#/lib/env.server";

import * as schema from "./schema";

const databaseUrl = new URL(getDatabaseUrl());
const sslCa = serverEnv.DATABASE_SSL_CA_BASE64
	? Buffer.from(serverEnv.DATABASE_SSL_CA_BASE64, "base64").toString("utf8")
	: undefined;
const ssl = sslCa
	? {
			ca: sslCa,
			rejectUnauthorized: true,
		}
	: undefined;

if (ssl) {
	databaseUrl.searchParams.delete("sslmode");
	databaseUrl.searchParams.delete("sslrootcert");
}

export const pool = new Pool({
	connectionString: databaseUrl.toString(),
	ssl,
	options: "-c search_path=flashcard",
	connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });
