import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
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
		<main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
			<Button asChild variant="ghost" className="absolute top-6 left-6">
				<Link to="/dashboard">
					<ArrowLeft />
					All cards
				</Link>
			</Button>
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
