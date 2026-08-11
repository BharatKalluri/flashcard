import { useEffect, useState } from "react";

import { Button } from "./ui/button";

export function PwaRegister() {
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
		null,
	);

	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;
		if (import.meta.env.DEV) {
			void navigator.serviceWorker
				.getRegistrations()
				.then((registrations) =>
					Promise.all(
						registrations.map((registration) => registration.unregister()),
					),
				);
			void caches
				.keys()
				.then((keys) =>
					Promise.all(
						keys
							.filter((key) => key.startsWith("flashcard-static-"))
							.map((key) => caches.delete(key)),
					),
				);
			return;
		}

		const register = async () => {
			const registration = await navigator.serviceWorker.register("/sw.js");

			if (registration.waiting && navigator.serviceWorker.controller) {
				setWaitingWorker(registration.waiting);
			}

			registration.addEventListener("updatefound", () => {
				const worker = registration.installing;
				if (!worker) return;

				worker.addEventListener("statechange", () => {
					if (
						worker.state === "installed" &&
						navigator.serviceWorker.controller
					) {
						setWaitingWorker(worker);
					}
				});
			});
		};

		void register();
	}, []);

	if (!waitingWorker) return null;

	const reload = () => {
		navigator.serviceWorker.addEventListener(
			"controllerchange",
			() => {
				window.location.reload();
			},
			{ once: true },
		);
		waitingWorker.postMessage({ type: "SKIP_WAITING" });
	};

	return (
		<div aria-live="polite" className="pwa-update">
			<span>Update ready.</span>
			<Button onClick={reload} size="sm" type="button">
				Reload
			</Button>
		</div>
	);
}
