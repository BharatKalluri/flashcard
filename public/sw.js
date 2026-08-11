const cacheName = "flashcard-static-v1";
const offlineUrl = "/offline.html";
const isDevelopmentServer =
	self.location.hostname === "localhost" && self.location.port === "3000";
const staticAssets = [
  offlineUrl,
  "/icons/flashcard-180.svg",
  "/icons/flashcard-192.svg",
  "/icons/flashcard-512.svg",
  "/icons/flashcard-maskable-512.svg",
];

self.addEventListener("install", (event) => {
	if (isDevelopmentServer) {
		self.skipWaiting();
		return;
	}

	event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(staticAssets)));
});

self.addEventListener("activate", (event) => {
	if (isDevelopmentServer) {
		event.waitUntil(
			caches
				.keys()
				.then((keys) =>
					Promise.all(
						keys
							.filter((key) => key.startsWith("flashcard-static-"))
							.map((key) => caches.delete(key)),
					),
				)
				.then(() => self.registration.unregister())
				.then(() => self.clients.matchAll({ type: "window" }))
				.then((clients) => Promise.all(clients.map((client) => client.navigate(client.url)))),
		);
		return;
	}

	event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(offlineUrl)));
    return;
  }

  if (!["font", "image", "script", "style"].includes(request.destination)) return;

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
