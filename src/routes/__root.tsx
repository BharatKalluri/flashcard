import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { LoaderCircle } from "lucide-react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Flashcard · VCF contact cards",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<NavigationProgress />
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NavigationProgress() {
	const isPending = useRouterState({
		select: (state) => state.status === "pending",
	});

	if (!isPending) return null;

	return (
		<div className="navigation-progress" aria-live="polite">
			<div className="navigation-progress__rail" aria-hidden="true">
				<div className="navigation-progress__rail-fill" />
			</div>
			<div className="navigation-progress__notice">
				<LoaderCircle
					className="navigation-progress__icon"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
}
