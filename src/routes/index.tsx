import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getCurrentUser } from "#/lib/auth.functions";
import { authClient } from "#/lib/auth-client";
import { listCards } from "#/lib/cards.functions";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		if (await getCurrentUser()) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: HomePage,
});

function HomePage() {
	return (
		<main className="min-h-screen px-5 py-6 sm:px-8 sm:py-10">
			<div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_420px]">
				<section className="rise-in max-w-2xl">
					<div className="mb-8 flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
							<QrCode className="size-5" />
						</div>
						<span className="island-kicker">Flashcard</span>
					</div>
					<p className="island-kicker mb-4">Your details, one scan away</p>
					<h1 className="display-title max-w-xl text-5xl leading-[0.98] font-medium tracking-tight text-foreground sm:text-7xl">
						A contact card people can actually scan.
					</h1>
					<p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
						Build separate public and private cards, then present a raw VCF QR
						code that opens the recipient’s native contact flow.
					</p>
					<div className="mt-8 grid gap-4 sm:grid-cols-3">
						<Feature
							icon={<Sparkles />}
							title="Simple"
							detail="Edit only what you want to share."
						/>
						<Feature
							icon={<ShieldCheck />}
							title="Private"
							detail="Cards are visible only after sign-in."
						/>
						<Feature
							icon={<QrCode />}
							title="Native"
							detail="The QR carries a real contact file."
						/>
					</div>
				</section>
				<AuthCard />
			</div>
		</main>
	);
}

function Feature({
	icon,
	title,
	detail,
}: {
	icon: React.ReactNode;
	title: string;
	detail: string;
}) {
	return (
		<div className="feature-card rounded-2xl border p-4">
			<div className="mb-3 flex size-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
				{icon}
			</div>
			<p className="font-semibold text-foreground">{title}</p>
			<p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p>
		</div>
	);
}

function AuthCard() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"signup" | "signin">("signup");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const response =
				mode === "signup"
					? await authClient.signUp.email({ name: email, email, password })
					: await authClient.signIn.email({ email, password });

			if (response.error) {
				throw new Error(response.error.message ?? "Could not sign you in.");
			}

			if (mode === "signup") {
				const [firstCard] = await listCards();
				if (firstCard) {
					await navigate({
						to: "/cards/$cardId",
						params: { cardId: firstCard.id },
					});
					return;
				}
			}

			await navigate({ to: "/dashboard" });
		} catch (submissionError) {
			setError(
				submissionError instanceof Error
					? submissionError.message
					: "Could not complete that request.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	const isSignup = mode === "signup";

	return (
		<Card className="island-shell rise-in w-full border-0 shadow-xl lg:justify-self-end">
			<CardHeader className="gap-3 px-7 pt-7">
				<div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground w-fit">
					{isSignup ? "Start with your first card" : "Welcome back"}
					<ArrowRight className="size-3.5" />
				</div>
				<CardTitle className="display-title text-3xl font-medium">
					{isSignup
						? "Make your first impression portable."
						: "Open your cards."}
				</CardTitle>
				<CardDescription>
					{isSignup
						? "Sign up free!"
						: "Your saved details stay behind your account."}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-7 pb-7">
				<div className="mb-6 grid grid-cols-2 rounded-lg bg-secondary p-1">
					<Button
						type="button"
						variant={isSignup ? "default" : "ghost"}
						size="sm"
						onClick={() => {
							setMode("signup");
							setError(null);
						}}
					>
						Sign up
					</Button>
					<Button
						type="button"
						variant={!isSignup ? "default" : "ghost"}
						size="sm"
						onClick={() => {
							setMode("signin");
							setError(null);
						}}
					>
						Sign in
					</Button>
				</div>
				<form className="space-y-4" onSubmit={submit}>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="you@example.com"
							autoComplete="email"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="At least 8 characters"
							autoComplete={isSignup ? "new-password" : "current-password"}
							minLength={8}
							required
						/>
					</div>
					{error ? (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}
					<Button className="w-full" size="lg" disabled={isSubmitting}>
						{isSubmitting
							? "Working…"
							: isSignup
								? "Create my card"
								: "Open Flashcard"}
						{!isSubmitting ? <ArrowRight /> : null}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
