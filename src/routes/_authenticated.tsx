import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getCurrentUser } from "#/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const user = await getCurrentUser();

		if (!user) {
			throw redirect({ to: "/" });
		}

		return { user };
	},
	component: () => <Outlet />,
});
