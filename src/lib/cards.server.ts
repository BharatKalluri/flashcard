import {
	getRequestHeaders,
	setResponseStatus,
} from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "#/db";
import { cards } from "#/db/schema";
import { auth } from "./auth";
import {
	type CardFields,
	cardFieldsSchema,
	getFieldLabels,
	hasName,
	saveCardFieldsSchema,
	toVcf,
} from "./card";

export async function requireUser() {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user) {
		setResponseStatus(401);
		throw new Error("Sign in required.");
	}

	return session.user;
}

function cardIdToBigInt(id: string) {
	if (!/^\d+$/.test(id)) {
		throw new Error("Invalid card id.");
	}

	return BigInt(id);
}

function serializeCard(row: typeof cards.$inferSelect) {
	const fields = cardFieldsSchema.parse(row.fields);

	return {
		id: row.id.toString(),
		name: row.name,
		fields,
		vcf: hasName(fields) ? toVcf(fields) : null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

function serializeCardSummary(row: typeof cards.$inferSelect) {
	const fields = cardFieldsSchema.parse(row.fields);

	return {
		id: row.id.toString(),
		name: row.name,
		labels: getFieldLabels(fields),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export async function listCardsForUser(userId: string) {
	const rows = await db
		.select()
		.from(cards)
		.where(eq(cards.userId, userId))
		.orderBy(desc(cards.updatedAt));

	return rows.map(serializeCardSummary);
}

export async function getCardForUser(userId: string, id: string) {
	const row = (
		await db
			.select()
			.from(cards)
			.where(and(eq(cards.userId, userId), eq(cards.id, cardIdToBigInt(id))))
			.limit(1)
	)[0];

	return row ? serializeCard(row) : null;
}

export async function updateCardForUser(
	userId: string,
	id: string,
	name: string,
	fields: CardFields,
) {
	const validatedFields = saveCardFieldsSchema.parse(fields);

	try {
		const row = (
			await db
				.update(cards)
				.set({ name, fields: validatedFields, updatedAt: new Date() })
				.where(and(eq(cards.userId, userId), eq(cards.id, cardIdToBigInt(id))))
				.returning()
		)[0];

		if (!row) {
			setResponseStatus(404);
			throw new Error("Card not found.");
		}

		return serializeCard(row);
	} catch (error) {
		if (error instanceof Error && error.message === "Card not found.") {
			throw error;
		}

		console.error("Failed to save card:", error);
		setResponseStatus(500);
		throw new Error(
			"Could not save this card. Your previous QR is still safe.",
		);
	}
}

export async function cloneCardForUser(
	userId: string,
	userEmail: string,
	id: string,
) {
	const source = (
		await db
			.select()
			.from(cards)
			.where(and(eq(cards.userId, userId), eq(cards.id, cardIdToBigInt(id))))
			.limit(1)
	)[0];

	if (!source) {
		setResponseStatus(404);
		throw new Error("Card not found.");
	}

	const sourceFields = cardFieldsSchema.parse(source.fields);
	const fields = sourceFields.emails.length
		? sourceFields
		: {
				...sourceFields,
				emails: [{ label: "home" as const, value: userEmail }],
			};
	const existingNames = new Set(
		(
			await db
				.select({ name: cards.name })
				.from(cards)
				.where(eq(cards.userId, userId))
		).map((row) => row.name),
	);

	// ponytail: linear name scan; use a database-side allocator only if card counts make this measurable.
	const baseName = `${source.name} copy`;
	let name = baseName;
	let suffix = 2;
	while (existingNames.has(name)) {
		name = `${baseName} ${suffix}`;
		suffix += 1;
	}

	try {
		const row = (
			await db.insert(cards).values({ userId, name, fields }).returning()
		)[0];

		if (!row) {
			throw new Error("Card clone returned no row.");
		}

		return serializeCardSummary(row);
	} catch (error) {
		console.error("Failed to duplicate card:", error);
		setResponseStatus(500);
		throw new Error("Could not duplicate this card.");
	}
}

export async function deleteCardForUser(userId: string, id: string) {
	const deleted = await db
		.delete(cards)
		.where(and(eq(cards.userId, userId), eq(cards.id, cardIdToBigInt(id))))
		.returning({ id: cards.id });

	if (deleted.length === 0) {
		setResponseStatus(404);
		throw new Error("Card not found.");
	}

	return { deleted: true };
}
