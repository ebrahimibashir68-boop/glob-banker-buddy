import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  amount: z.number().positive().max(10000),
  memo: z.string().min(1).max(128),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const Route = createFileRoute("/api/public/pi/payout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["PI_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "Pi API key is not configured." }, { status: 500 });
        }

        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
        if (!token) {
          return Response.json({ error: "Connect your Pi wallet first." }, { status: 401 });
        }

        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        // Verify the caller with the Pi Platform API and resolve their uid.
        const meRes = await fetch("https://api.minepi.com/v2/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) {
          return Response.json({ error: "Pi wallet session expired." }, { status: 401 });
        }
        const me = (await meRes.json()) as { uid?: string };
        if (!me.uid) {
          return Response.json({ error: "Pi wallet session expired." }, { status: 401 });
        }

        const createRes = await fetch("https://api.minepi.com/v2/payments", {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment: {
              amount: parsed.data.amount,
              memo: parsed.data.memo,
              metadata: parsed.data.metadata ?? {},
              uid: me.uid,
            },
          }),
        });

        if (!createRes.ok) {
          console.error("Pi payout create failed", createRes.status, await createRes.text());
          return Response.json({ error: "Payout could not be created." }, { status: 502 });
        }

        const payment = (await createRes.json()) as { identifier?: string };
        return Response.json({
          paymentId: payment.identifier ?? "",
          status: "queued for app wallet signature",
        });
      },
    },
  },
});
