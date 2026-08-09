import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { saveCardFieldsSchema } from "./card";
import {
	cloneCardForUser,
	deleteCardForUser,
	getCardForUser,
	listCardsForUser,
	requireUser,
	updateCardForUser,
} from "./cards.server";

const cardIdSchema = z.string().regex(/^\d+$/, "Invalid card id.");
const cardIdInputSchema = z.object({ id: cardIdSchema }).strict();

export const listCards = createServerFn({ method: "GET" }).handler(async () => {
	const user = await requireUser();
	return listCardsForUser(user.id);
});

export const getCard = createServerFn({ method: "GET" })
	.validator(cardIdInputSchema)
	.handler(async ({ data }) => {
		const user = await requireUser();
		return getCardForUser(user.id, data.id);
	});

export const updateCard = createServerFn({ method: "POST" })
	.validator(
		z
			.object({
				id: cardIdSchema,
				name: z.string().trim().min(1).max(120),
				fields: saveCardFieldsSchema,
			})
			.strict(),
	)
	.handler(async ({ data }) => {
		const user = await requireUser();
		return updateCardForUser(user.id, data.id, data.name, data.fields);
	});

export const cloneCard = createServerFn({ method: "POST" })
	.validator(cardIdInputSchema)
	.handler(async ({ data }) => {
		const user = await requireUser();
		return cloneCardForUser(user.id, user.email, data.id);
	});

export const deleteCard = createServerFn({ method: "POST" })
	.validator(cardIdInputSchema)
	.handler(async ({ data }) => {
		const user = await requireUser();
		return deleteCardForUser(user.id, data.id);
	});
