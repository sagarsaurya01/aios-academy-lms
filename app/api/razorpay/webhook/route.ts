import { NextRequest } from "next/server";
import { verifyWebhook } from "@/lib/razorpay";

// Razorpay webhook. Verifies the signature; idempotent (ignores replays by
// payment id). In this in-memory build it just acknowledges — the real order
// is created at checkout. With Supabase, confirm the order here instead.
const seen = new Set<string>();

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhook(raw, sig)) return new Response("invalid signature", { status: 400 });
  let event: any;
  try { event = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
  const paymentId = event?.payload?.payment?.entity?.id;
  if (paymentId && seen.has(paymentId)) return new Response("ok (dup)", { status: 200 });
  if (paymentId) seen.add(paymentId);
  // event.event === "payment.captured" -> mark the order paid (with Supabase)
  return new Response("ok", { status: 200 });
}
