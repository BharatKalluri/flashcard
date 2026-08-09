import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export function AppHeader({ email }: { email: string }) {
	const navigate = useNavigate();

	async function signOut() {
		await authClient.signOut();
		await navigate({ to: "/" });
	}

	return (
		<header className="page-wrap flex items-center justify-between gap-4 py-5">
			<Link to="/dashboard" className="no-underline">
				<span className="island-kicker">Flashcard</span>
			</Link>
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="hidden sm:inline-flex">
					{email}
				</Badge>
				<Button variant="ghost" size="sm" onClick={() => void signOut()}>
					<LogOut />
					<span className="hidden sm:inline">Sign out</span>
				</Button>
			</div>
		</header>
	);
}
