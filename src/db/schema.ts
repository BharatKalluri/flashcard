import { sql } from "drizzle-orm";
import {
	bigint,
	check,
	jsonb,
	pgSchema,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import type { CardFields } from "#/lib/card";

const flashcard = pgSchema("flashcard");

export const cards = flashcard.table(
	"card",
	{
		id: bigint("id", { mode: "bigint" })
			.generatedAlwaysAsIdentity()
			.primaryKey(),
		userId: text("user_id").notNull(),
		name: text("name").notNull(),
		fields: jsonb("fields")
			.$type<CardFields>()
			.notNull()
			.default(sql`'{}'::jsonb`),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		unique("card_user_name_unique").on(table.userId, table.name),
		check("card_name_not_blank", sql`btrim(${table.name}) <> ''`),
		check("card_fields_object", sql`jsonb_typeof(${table.fields}) = 'object'`),
	],
);
