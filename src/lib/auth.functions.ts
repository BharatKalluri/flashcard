import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "./auth";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await auth.api.getSession({ headers: getRequestHeaders() });

		if (!session?.user) {
			return null;
		}

		return {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
		};
	},
);
