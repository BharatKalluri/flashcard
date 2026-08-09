import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	ArrowLeft,
	Check,
	ExternalLink,
	Plus,
	Save,
	Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import { AppHeader } from "#/components/app-header";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import { Textarea } from "#/components/ui/textarea";
import {
	type CardFields,
	fieldLabels,
	hasName,
	type LabeledValue,
} from "#/lib/card";
import { getCard, updateCard } from "#/lib/cards.functions";

export const Route = createFileRoute("/_authenticated/cards/$cardId")({
	loader: async ({ params }) => {
		const card = await getCard({ data: { id: params.cardId } });
		if (!card) throw notFound();
		return card;
	},
	component: CardEditorPage,
});

type TextListProps = {
	title: string;
	description: string;
	values: string[];
	placeholder: string;
	onChange: (values: string[]) => void;
};

function TextList({
	title,
	description,
	values,
	placeholder,
	onChange,
}: TextListProps) {
	const rowIds = useRef(values.map(() => crypto.randomUUID()));

	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="space-y-2">
				{values.length === 0 ? (
					<p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
						None added yet.
					</p>
				) : null}
				{values.map((value, index) => (
					<div key={rowIds.current[index]} className="flex items-center gap-2">
						<Input
							value={value}
							placeholder={placeholder}
							onChange={(event) => {
								const next = [...values];
								next[index] = event.target.value;
								onChange(next);
							}}
							aria-label={`${title} ${index + 1}`}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => {
								rowIds.current.splice(index, 1);
								onChange(values.filter((_, itemIndex) => itemIndex !== index));
							}}
							aria-label={`Remove ${title} ${index + 1}`}
						>
							<Trash2 />
						</Button>
					</div>
				))}
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => {
					rowIds.current.push(crypto.randomUUID());
					onChange([...values, ""]);
				}}
			>
				<Plus />
				Add {title.toLowerCase()}
			</Button>
		</section>
	);
}

type LabeledListProps = {
	title: string;
	description: string;
	values: LabeledValue[];
	placeholder: string;
	onChange: (values: LabeledValue[]) => void;
};

function LabeledList({
	title,
	description,
	values,
	placeholder,
	onChange,
}: LabeledListProps) {
	const rowIds = useRef(values.map(() => crypto.randomUUID()));

	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="space-y-2">
				{values.length === 0 ? (
					<p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
						None added yet.
					</p>
				) : null}
				{values.map((item, index) => (
					<div
						key={rowIds.current[index]}
						className="grid grid-cols-[minmax(0,1fr)_7rem_auto] items-center gap-2"
					>
						<Input
							value={item.value}
							placeholder={placeholder}
							onChange={(event) => {
								const next = [...values];
								next[index] = { ...item, value: event.target.value };
								onChange(next);
							}}
							aria-label={`${title} ${index + 1}`}
						/>
						<Select
							value={item.label}
							onValueChange={(label) => {
								const next = [...values];
								next[index] = {
									...item,
									label: label as LabeledValue["label"],
								};
								onChange(next);
							}}
						>
							<SelectTrigger aria-label={`${title} label ${index + 1}`}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fieldLabels.map((label) => (
									<SelectItem key={label} value={label}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => {
								rowIds.current.splice(index, 1);
								onChange(values.filter((_, itemIndex) => itemIndex !== index));
							}}
							aria-label={`Remove ${title} ${index + 1}`}
						>
							<Trash2 />
						</Button>
					</div>
				))}
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => {
					rowIds.current.push(crypto.randomUUID());
					onChange([...values, { label: "other", value: "" }]);
				}}
			>
				<Plus />
				Add {title.toLowerCase()}
			</Button>
		</section>
	);
}

function CardEditorPage() {
	const card = Route.useLoaderData();
	const { user } = Route.useRouteContext();
	const [cardName, setCardName] = useState(card.name);
	const [fields, setFields] = useState<CardFields>(card.fields);
	const [dirty, setDirty] = useState(false);
	const [saveState, setSaveState] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const [saveError, setSaveError] = useState<string | null>(null);
	const saveCard = useServerFn(updateCard);
	const fieldsRef = useRef(fields);
	const cardNameRef = useRef(cardName);

	const updateField = <K extends keyof CardFields>(
		key: K,
		value: CardFields[K],
	) => {
		const nextFields = { ...fields, [key]: value };
		fieldsRef.current = nextFields;
		setFields(nextFields);
		setDirty(true);
		setSaveState("idle");
		setSaveError(null);
	};

	function updateCardName(value: string) {
		cardNameRef.current = value;
		setCardName(value);
		setDirty(true);
		setSaveState("idle");
		setSaveError(null);
	}

	async function save() {
		const fieldsToSave = fields;
		setSaveState("saving");
		setSaveError(null);

		try {
			await saveCard({
				data: { id: card.id, name: cardName.trim(), fields: fieldsToSave },
			});
			if (
				fieldsRef.current === fieldsToSave &&
				cardNameRef.current === cardName
			) {
				setDirty(false);
				setSaveState("saved");
			}
		} catch (saveMutationError) {
			setSaveState("error");
			setSaveError(
				saveMutationError instanceof Error
					? saveMutationError.message
					: "Could not save this card.",
			);
		}
	}

	const statusText =
		saveState === "saving"
			? "Saving…"
			: saveState === "saved"
				? "Saved"
				: dirty
					? "Unsaved changes"
					: hasName(fields)
						? "Saved"
						: "Add a given or family name to create a QR.";

	return (
		<div className="min-h-screen">
			<AppHeader email={user.email} />
			<main className="page-wrap pb-16">
				<div className="mb-8 flex flex-col gap-4 pt-8 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<Button asChild variant="ghost" className="mb-4 -ml-3">
							<Link to="/dashboard">
								<ArrowLeft />
								All cards
							</Link>
						</Button>
						<h1 className="display-title text-5xl leading-none font-medium tracking-tight text-foreground">
							Build the details.
						</h1>
					</div>
					<div className="flex items-center gap-3 self-start sm:self-auto">
						<div
							className="flex items-center gap-2 text-sm text-muted-foreground"
							aria-live="polite"
						>
							{saveState === "saving" ? (
								<Save className="size-4 animate-pulse" />
							) : null}
							{saveState === "saved" ? (
								<Check className="size-4 text-primary" />
							) : null}
							<span>{statusText}</span>
						</div>
						<Button
							disabled={!dirty || saveState === "saving"}
							onClick={() => void save()}
						>
							<Save />
							Save
						</Button>
					</div>
				</div>
				{saveError ? (
					<Alert variant="destructive" className="mb-6">
						<AlertDescription>{saveError}</AlertDescription>
					</Alert>
				) : null}
				<div>
					<Card className="feature-card border-0">
						<CardHeader>
							<CardTitle>Contact fields</CardTitle>
							<CardDescription>
								Add only the details you want this card to share. Blank rows are
								ignored.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-8">
							<div className="space-y-2">
								<Label htmlFor="card-name">Card name</Label>
								<Input
									id="card-name"
									value={cardName}
									onChange={(event) => updateCardName(event.target.value)}
									maxLength={120}
								/>
							</div>
							<Separator />
							<div className="grid gap-8 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="given-name">Given name</Label>
									<Input
										id="given-name"
										value={fields.givenName[0] ?? ""}
										onChange={(event) =>
											updateField(
												"givenName",
												event.target.value ? [event.target.value] : [],
											)
										}
										placeholder="Bharat"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="family-name">Family name</Label>
									<Input
										id="family-name"
										value={fields.familyName[0] ?? ""}
										onChange={(event) =>
											updateField(
												"familyName",
												event.target.value ? [event.target.value] : [],
											)
										}
										placeholder="Kalluri"
									/>
								</div>
							</div>
							<Separator />
							<LabeledList
								title="Email"
								description="Multiple addresses are okay; labels stay limited to four useful choices."
								values={fields.emails}
								placeholder="you@example.com"
								onChange={(values) => updateField("emails", values)}
							/>
							<LabeledList
								title="Phone"
								description="Enter phone numbers as you want them displayed."
								values={fields.phones}
								placeholder="+91 12345 67890"
								onChange={(values) => updateField("phones", values)}
							/>
							<TextList
								title="Company"
								description="Add multiple organizations when you need them."
								values={fields.organizations}
								placeholder="Flashcard"
								onChange={(values) => updateField("organizations", values)}
							/>
							<TextList
								title="Job title"
								description="Add multiple titles when a card needs more than one."
								values={fields.jobTitles}
								placeholder="Product engineer"
								onChange={(values) => updateField("jobTitles", values)}
							/>
							<LabeledList
								title="Website"
								description="Multiple URLs are supported and can each have a label."
								values={fields.websites}
								placeholder="https://example.com"
								onChange={(values) => updateField("websites", values)}
							/>
							<div className="space-y-3">
								<div>
									<Label htmlFor="linkedin">LinkedIn</Label>
									<p className="mt-1 text-sm text-muted-foreground">
										One optional profile URL.
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Input
										id="linkedin"
										type="url"
										value={fields.linkedInUrl ?? ""}
										onChange={(event) =>
											updateField("linkedInUrl", event.target.value)
										}
										placeholder="https://linkedin.com/in/you"
									/>
									<ExternalLink className="size-4 shrink-0 text-muted-foreground" />
								</div>
							</div>
							<div className="space-y-3">
								<div className="flex items-end justify-between gap-3">
									<div>
										<Label htmlFor="note">Note</Label>
										<p className="mt-1 text-sm text-muted-foreground">
											One optional note, maximum 200 characters.
										</p>
									</div>
									<Badge variant="outline">
										{(fields.note ?? "").length}/200
									</Badge>
								</div>
								<Textarea
									id="note"
									value={fields.note ?? ""}
									onChange={(event) => updateField("note", event.target.value)}
									maxLength={200}
									placeholder="Met at IndiaFOSS"
									rows={4}
								/>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								disabled={!dirty || saveState === "saving"}
								onClick={() => void save()}
							>
								<Save />
								Save
							</Button>
						</CardFooter>
					</Card>
				</div>
			</main>
		</div>
	);
}
