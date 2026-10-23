import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getCourse } from "@/lib/data";
import { quote, rupees, SELLER } from "@/lib/gst";
import { razorpayLive } from "@/lib/razorpay";
import { checkoutAction } from "@/app/actions";

const STATES = ["West Bengal", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Telangana", "Uttar Pradesh", "Bihar", "Jharkhand", "Odisha", "Assam", "Rajasthan", "Other state"];

// The quote preview is server-rendered from the form state in the URL (GET),
// so GST updates when you change state/qty/coupon. "Pay" posts the action.
export default function CheckoutPage({
  params, searchParams,
}: { params: { courseId: string }; searchParams: { qty?: string; state?: string; coupon?: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  const course = getCourse(params.courseId);
  if (!course) notFound();
  if (!course.priceMinor) redirect(`/courses/${course.id}`); // free courses enrol directly

  const qty = Math.max(1, Number(searchParams.qty || 1));
  const state = searchParams.state || "West Bengal";
  const coupon = searchParams.coupon || "";
  const q = quote(course.priceMinor, qty, state, coupon);

  return (
    <Shell user={me}>
      <Link href={`/courses/${course.id}`} className="text-sm text-muted hover:text-ink">← {course.title}</Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-ink">Checkout</h1>
      <p className="mb-4 text-sm text-muted">
        {razorpayLive ? "Pay by UPI, card, net banking or EMI via Razorpay." : "Razorpay test mode is not connected yet — this completes a simulated payment and still generates a GST invoice."}
      </p>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* buyer + options (GET form updates the quote) */}
        <form method="get" className="card space-y-4">
          <div><b className="text-ink">{course.title}</b><div className="text-sm text-muted">{rupees(course.priceMinor)} each</div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="qty">Seats</label><input id="qty" name="qty" type="number" min="1" max="500" defaultValue={qty} className="field" /></div>
            <div><label className="label" htmlFor="state">Your state</label>
              <select id="state" name="state" defaultValue={state} className="field">{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="label" htmlFor="coupon">Coupon (try AIOS10)</label><input id="coupon" name="coupon" defaultValue={coupon} className="field" /></div>
          <button className="btn-ghost text-sm">Update quote</button>
          <p className="text-xs text-muted">10+ seats get a 15% bulk discount. GST is CGST+SGST within West Bengal, IGST elsewhere.</p>
        </form>

        {/* quote + pay */}
        <aside className="card">
          <h2 className="label">Order summary</h2>
          <dl className="space-y-1 text-sm">
            <Row k={qty > 1 ? `${qty} seats × ${rupees(course.priceMinor)}` : "Course fee"} v={rupees(q.gross)} />
            {q.discount > 0 && <Row k={`Discount${q.coupon ? ` (${q.coupon})` : ""}${q.note ? " · " + q.note : ""}`} v={"− " + rupees(q.discount)} />}
            {q.couponBad && <div className="text-xs text-bad">That coupon isn’t valid.</div>}
            <Row k="Taxable value" v={rupees(q.taxable)} />
            {q.intra
              ? <><Row k="CGST 9%" v={rupees(q.cgst)} /><Row k="SGST 9%" v={rupees(q.sgst)} /></>
              : <Row k="IGST 18%" v={rupees(q.igst)} />}
          </dl>
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <span>You pay</span><span>{rupees(q.total)}</span>
          </div>
          <form action={checkoutAction} className="mt-4 space-y-3">
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="qty" value={qty} />
            <input type="hidden" name="state" value={state} />
            <input type="hidden" name="coupon" value={coupon} />
            <div><label className="label" htmlFor="name">{qty > 1 ? "Company name" : "Your name"}</label><input id="name" name="name" defaultValue={me.name} className="field" required /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={me.email} className="field" required /></div>
            <div><label className="label" htmlFor="gstin">GSTIN (optional)</label><input id="gstin" name="gstin" maxLength={15} className="field" placeholder="For input tax credit" /></div>
            <button className="btn w-full">{razorpayLive ? "Pay with Razorpay" : "Pay (test)"} · {rupees(q.total)}</button>
          </form>
          <p className="mt-2 text-xs text-muted">A GST invoice is created as soon as payment succeeds. Seller: {SELLER.name}.</p>
        </aside>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="text-ink">{v}</dd></div>;
}
