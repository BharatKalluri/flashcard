import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
		);
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-2">
				{session.user.image ? (
					<img src={session.user.image} alt="" className="h-8 w-8" />
				) : (
					<div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
						<span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
							{session.user.name?.charAt(0).toUpperCase() || "U"}
						</span>
					</div>
				)}
				<Button
					variant="outline"
					onClick={() => {
						void authClient.signOut();
					}}
				>
					Sign out
				</Button>
			</div>
		);
	}

	return null;
}
