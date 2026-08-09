import { pool } from "./index";

const result = await pool.query<{
	table_schema: string;
	table_name: string;
}>(
	"select table_schema, table_name from information_schema.tables where table_schema not in ('pg_catalog', 'information_schema') order by table_schema, table_name",
);
const session = await pool.query<{
	current_schema: string;
	search_path: string[];
}>("select current_schema(), current_schemas(true) as search_path");

const knownTables = new Set([
	"card",
	"user",
	"session",
	"account",
	"verification",
	"rate_limit",
	"__drizzle_migrations",
	"todos",
]);
const misplaced = result.rows.filter(
	(row) => row.table_schema === "public" && knownTables.has(row.table_name),
);

console.log(JSON.stringify({ session: session.rows[0], tables: result.rows }));

if (misplaced.length > 0) {
	throw new Error(
		`Flashcard tables found in public: ${JSON.stringify(misplaced)}`,
	);
}

await pool.end();
