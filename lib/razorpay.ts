// Razorpay server helpers. Live when RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are
// set (test keys first); otherwise a simulated mode so the flow runs locally
// without keys. The secret is SERVER-ONLY — never import this into a client file.
import crypto from "crypto";

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const razorpayLive = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

// Create a Razorpay order (amount in paise). Returns the order id to hand the
// checkout widget. In simulated mode, returns a fake order id.
export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<{ id: string; amount: number; simulated: boolean }> {
  if (!razorpayLive) return { id: "order_sim_" + receipt, amount: amountPaise, simulated: true };
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error("Razorpay order failed: " + res.status);
  const o = await res.json();
  return { id: o.id, amount: o.amount, simulated: false };
}

// Verify the signature Razorpay returns to the browser after a successful pay.
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!razorpayLive) return true; // simulated mode
  const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""));
}

// Verify a webhook payload against RAZORPAY_WEBHOOK_SECRET.
export function verifyWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || "")); }
  catch { return false; }
}
