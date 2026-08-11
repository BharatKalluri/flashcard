import { config } from "dotenv";
import { z } from "zod";

config({ path: [".env.local", ".env"] });

const serverEnvSchema = z.object({
	DATABASE_URL: z.string().min(1),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string().url().optional(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error("Invalid server environment configuration.");
}

export const serverEnv = parsed.data;

export function getDatabaseUrl() {
	const databaseUrl = new URL(serverEnv.DATABASE_URL);
	databaseUrl.searchParams.delete("sslrootcert");

	return databaseUrl.toString();
}
