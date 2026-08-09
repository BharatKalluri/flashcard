import { z } from "zod";

export const fieldLabels = ["home", "work", "mobile", "other"] as const;
export const fieldLabelSchema = z.enum(fieldLabels);

const textValuesSchema = z
	.array(z.string().trim().max(500))
	.max(20)
	.transform((values) => values.filter(Boolean));
const nameValueSchema = textValuesSchema.transform((values) =>
	values.slice(0, 1),
);
const emailValidator = z.email();
const urlValidator = z.url();
const labeledValuesSchema = (valueSchema = z.string().trim().max(500)) =>
	z
		.array(z.object({ label: fieldLabelSchema, value: valueSchema }).strict())
		.max(20)
		.transform((values) => values.filter((item) => item.value.length > 0));
const emailValueSchema = z
	.string()
	.trim()
	.max(500)
	.refine(
		(value) => value === "" || emailValidator.safeParse(value).success,
		"Enter a valid email address.",
	);
const urlValueSchema = z
	.string()
	.trim()
	.max(500)
	.refine(
		(value) => value === "" || urlValidator.safeParse(value).success,
		"Enter a valid URL.",
	);

export const cardFieldsSchema = z.object({
	givenName: nameValueSchema.default([]),
	familyName: nameValueSchema.default([]),
	emails: labeledValuesSchema(emailValueSchema).default([]),
	phones: labeledValuesSchema().default([]),
	organizations: textValuesSchema.default([]),
	jobTitles: textValuesSchema.default([]),
	websites: labeledValuesSchema(urlValueSchema).default([]),
	linkedInUrl: z.union([z.string().url(), z.literal("")]).optional(),
	note: z.string().trim().max(200).optional(),
});

export const saveCardFieldsSchema = cardFieldsSchema.superRefine(
	(fields, context) => {
		if (fields.givenName.length === 0 && fields.familyName.length === 0) {
			context.addIssue({
				code: "custom",
				path: ["givenName"],
				message: "Add a given or family name before saving.",
			});
		}
	},
);

export type CardFields = z.infer<typeof cardFieldsSchema>;
export type LabeledValue = CardFields["emails"][number];

export const emptyCardFields: CardFields = {
	givenName: [],
	familyName: [],
	emails: [],
	phones: [],
	organizations: [],
	jobTitles: [],
	websites: [],
	linkedInUrl: undefined,
	note: undefined,
};

export function createInitialCardFields(email: string): CardFields {
	return {
		...emptyCardFields,
		emails: [{ label: "home", value: email }],
	};
}

export function hasName(fields: CardFields) {
	return fields.givenName.length > 0 || fields.familyName.length > 0;
}

export function normalizeCardFields(fields: unknown): CardFields {
	return cardFieldsSchema.parse(fields);
}

export function getFieldLabels(fields: CardFields) {
	return [
		hasName(fields) && "Name",
		fields.emails.length > 0 && "Email",
		fields.phones.length > 0 && "Phone",
		fields.organizations.length > 0 && "Company",
		fields.jobTitles.length > 0 && "Title",
		fields.websites.length > 0 && "Website",
		Boolean(fields.linkedInUrl) && "LinkedIn",
		Boolean(fields.note) && "Note",
	].filter((label): label is string => Boolean(label));
}

function escapeVcardText(value: string) {
	return value
		.replaceAll("\\", "\\\\")
		.replaceAll(";", "\\;")
		.replaceAll(",", "\\,")
		.replaceAll(/\r\n|\r|\n/g, "\\n");
}

function joinNameValues(values: string[]) {
	return values.map(escapeVcardText).join(",");
}

function addLabeledLines(
	lines: string[],
	property: string,
	values: LabeledValue[],
) {
	for (const item of values) {
		lines.push(`${property};TYPE=${item.label}:${escapeVcardText(item.value)}`);
	}
}

export function toVcf(input: CardFields) {
	const fields = saveCardFieldsSchema.parse(input);
	const fullName = [...fields.givenName, ...fields.familyName]
		.filter(Boolean)
		.join(" ");

	const lines = [
		"BEGIN:VCARD",
		"VERSION:4.0",
		`FN:${escapeVcardText(fullName)}`,
		`N:${joinNameValues(fields.familyName)};${joinNameValues(fields.givenName)};;;`,
	];

	addLabeledLines(lines, "EMAIL", fields.emails);
	addLabeledLines(lines, "TEL", fields.phones);

	for (const organization of fields.organizations) {
		lines.push(`ORG:${escapeVcardText(organization)}`);
	}

	for (const jobTitle of fields.jobTitles) {
		lines.push(`TITLE:${escapeVcardText(jobTitle)}`);
	}

	addLabeledLines(lines, "URL", fields.websites);

	if (fields.linkedInUrl) {
		lines.push(`URL;TYPE=linkedin:${escapeVcardText(fields.linkedInUrl)}`);
	}

	if (fields.note) {
		lines.push(`NOTE:${escapeVcardText(fields.note)}`);
	}

	lines.push("END:VCARD");
	return `${lines.join("\r\n")}\r\n`;
}
