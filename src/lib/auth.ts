import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db, pool } from "#/db";
import { cards } from "#/db/schema";

import { createInitialCardFields } from "./card";
import { serverEnv } from "./env.server";

export const auth = betterAuth({
	database: pool,
	baseURL: serverEnv.BETTER_AUTH_URL,
	secret: serverEnv.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await db
						.insert(cards)
						.values({
							userId: user.id,
							name: "Default card",
							fields: createInitialCardFields(user.email),
						})
						.onConflictDoNothing();
				},
			},
		},
	},
	plugins: [tanstackStartCookies()],
});
