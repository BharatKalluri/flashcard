import { createFileRoute, notFound } from "@tanstack/react-router";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { getCard } from "#/lib/cards.functions";

export const Route = createFileRoute("/_authenticated/present/$cardId")({
	loader: async ({ params }) => {
		const card = await getCard({ data: { id: params.cardId } });
		if (!card) throw notFound();
		return card;
	},
	component: CardPresentationPage,
});

function CardPresentationPage() {
	const card = Route.useLoaderData();
	const [dataUrl, setDataUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!card.vcf) return;
		void QRCode.toDataURL(card.vcf, {
			errorCorrectionLevel: "M",
			margin: 2,
			width: 720,
		}).then(setDataUrl);
	}, [card.vcf]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
			<h1 className="display-title text-4xl font-medium tracking-tight text-foreground">
				{card.name}
			</h1>
			{dataUrl ? (
				<img
					src={dataUrl}
					alt={`${card.name} contact QR code`}
					className="w-full max-w-md rounded-2xl bg-white p-4 shadow-sm"
				/>
			) : null}
		</main>
	);
}
