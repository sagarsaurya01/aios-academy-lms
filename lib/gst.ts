// GST + invoice engine, ported from the aios-lms prototype. Money in paise.
// Intra-state (seller in West Bengal, buyer in WB) -> CGST 9% + SGST 9%.
// Inter-state -> IGST 18%. Bulk discount 15% at 10+ seats. Coupons optional.

export const SELLER = {
  name: "Aikigai Edtech LLP",
  place: "Kolkata, West Bengal",
  state: "West Bengal",
  gstin: process.env.NEXT_PUBLIC_SELLER_GSTIN || "To be added before launch",
};
export const SAC = "999293"; // online education services

const COUPONS: Record<string, { label: string; pct?: number; flat?: number }> = {
  AIOS10: { label: "10% off", pct: 10 },
  LAUNCH500: { label: "₹500 off", flat: 50000 }, // flat in paise
};

const r2 = (n: number) => Math.round(n); // paise are integers
export const rupees = (paise: number) =>
  "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 });

export type Quote = {
  gross: number; discount: number; note: string; coupon: string; couponBad: boolean;
  taxable: number; cgst: number; sgst: number; igst: number; total: number; intra: boolean;
};

export function quote(priceMinor: number, qty: number, buyerState: string, coupon = ""): Quote {
  const gross = priceMinor * qty;
  let discount = 0, note = "";
  if (qty >= 10) { discount += r2(gross * 0.15); note = "15% bulk discount (10+ seats)"; }
  const cp = COUPONS[coupon.trim().toUpperCase()];
  if (cp) discount += cp.pct ? r2((gross - discount) * cp.pct / 100) : Math.min(cp.flat!, gross - discount);
  const taxable = gross - discount;
  const intra = buyerState === SELLER.state;
  const cgst = intra ? r2(taxable * 0.09) : 0;
  const sgst = cgst;
  const igst = intra ? 0 : r2(taxable * 0.18);
  return {
    gross, discount, note, coupon: cp ? coupon.trim().toUpperCase() : "", couponBad: !!coupon.trim() && !cp,
    taxable, cgst, sgst, igst, total: taxable + cgst + sgst + igst, intra,
  };
}

// ---- amount in words (Indian system) ----
function words(n: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number): string => (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : ""));
  const three = (n: number): string => (n >= 100 ? a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " : "") : "") + (n % 100 ? two(n % 100) : "");
  if (n === 0) return "Zero";
  const out: string[] = [];
  const cr = Math.floor(n / 1e7); n %= 1e7;
  const lk = Math.floor(n / 1e5); n %= 1e5;
  const th = Math.floor(n / 1000); n %= 1000;
  if (cr) out.push(three(cr) + " Crore");
  if (lk) out.push(two(lk) + " Lakh");
  if (th) out.push(two(th) + " Thousand");
  if (n) out.push(three(n));
  return out.join(" ");
}
export function amountWords(paise: number): string {
  const r = Math.floor(paise / 100), p = paise % 100;
  return "Indian Rupees " + words(r) + (p ? " and " + words(p) + " Paise" : "") + " Only";
}

export function invoiceNo(seq: number): string {
  return "AIOS/26-27/" + String(seq).padStart(4, "0");
}
