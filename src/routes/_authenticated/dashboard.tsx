import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Copy, Edit3, FolderOpen, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppHeader } from "#/components/app-header";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
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
import { cloneCard, deleteCard, listCards } from "#/lib/cards.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
	loader: () => listCards(),
	component: DashboardPage,
});

function DashboardPage() {
	const initialCards = Route.useLoaderData();
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();
	const [cards, setCards] = useState(initialCards);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function duplicate(id: string) {
		setBusyId(id);
		setError(null);
		try {
			const copy = await cloneCard({ data: { id } });
			setCards((current) => [copy, ...current]);
			await navigate({
				to: "/cards/$cardId",
				params: { cardId: copy.id },
			});
		} catch (mutationError) {
			setError(
				mutationError instanceof Error
					? mutationError.message
					: "Could not duplicate that card.",
			);
		} finally {
			setBusyId(null);
		}
	}

	async function confirmDelete() {
		if (!deleteId) return;

		setBusyId(deleteId);
		setError(null);
		try {
			await deleteCard({ data: { id: deleteId } });
			setCards((current) => current.filter((card) => card.id !== deleteId));
			setDeleteId(null);
		} catch (mutationError) {
			setError(
				mutationError instanceof Error
					? mutationError.message
					: "Could not delete that card.",
			);
		} finally {
			setBusyId(null);
		}
	}

	return (
		<div className="min-h-screen">
			<AppHeader email={user.email} />
			<main className="page-wrap pb-16">
				<section className="mb-7 pt-7">
					<div>
						<h1 className="display-title text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
							Your cards
						</h1>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Open a saved QR, or edit a card’s details.
						</p>
					</div>
				</section>
				{error ? (
					<div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
						{error}
					</div>
				) : null}
				{cards.length === 0 ? (
					<Card className="island-shell border-0 text-center">
						<CardContent className="flex flex-col items-center gap-4 py-16">
							<div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
								<FolderOpen className="size-5" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-foreground">
									No cards yet
								</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Sign out and back in after database setup if this is a fresh
									account.
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-5 md:grid-cols-2">
						{cards.map((card) => {
							const isBusy = busyId === card.id;
							return (
								<Card
									key={card.id}
									className="feature-card relative gap-4 border-0 py-5"
								>
									<Link
										to="/present/$cardId"
										params={{ cardId: card.id }}
										className="absolute inset-0 rounded-xl"
										aria-label={`Open ${card.name}`}
									/>
									<CardHeader className="pointer-events-none">
										<div className="flex items-start justify-between gap-4">
											<div>
												<CardTitle className="flex items-center gap-1.5 text-xl">
													{card.name}
													<ArrowUpRight className="size-4 text-muted-foreground" />
												</CardTitle>
												<CardDescription className="mt-2">
													{card.labels.length > 0
														? card.labels.join(" · ")
														: "No contact fields saved yet"}
												</CardDescription>
											</div>
											<Badge variant="secondary">
												{card.labels.length} fields
											</Badge>
										</div>
									</CardHeader>
									<CardFooter className="relative z-10 flex-wrap gap-2 border-t border-border/60 pt-4">
										<Button
											variant="ghost"
											size="icon"
											disabled={isBusy}
											onClick={() => void duplicate(card.id)}
											aria-label={`Duplicate ${card.name}`}
										>
											<Copy />
										</Button>
										<Button asChild variant="ghost" size="icon">
											<Link
												to="/cards/$cardId"
												params={{ cardId: card.id }}
												aria-label={`Edit ${card.name}`}
											>
												<Edit3 />
											</Link>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											onClick={() => setDeleteId(card.id)}
											aria-label={`Delete ${card.name}`}
										>
											<Trash2 />
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)}
			</main>
			<AlertDialog
				open={Boolean(deleteId)}
				onOpenChange={(open) => {
					if (!open && !busyId) setDeleteId(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this card?</AlertDialogTitle>
						<AlertDialogDescription>
							Its saved contact fields and QR source will be deleted
							permanently.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={Boolean(busyId)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={Boolean(busyId)}
							onClick={(event) => {
								event.preventDefault();
								void confirmDelete();
							}}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							{busyId ? "Deleting…" : "Delete card"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
