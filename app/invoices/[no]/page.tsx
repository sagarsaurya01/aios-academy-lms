import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getOrder, getCourse } from "@/lib/data";
import { rupees, amountWords, SELLER, SAC } from "@/lib/gst";

export default function InvoicePage({ params }: { params: { no: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  const order = getOrder(decodeURIComponent(params.no));
  if (!order) notFound();
  const course = getCourse(order.courseId);
  const d = new Date(order.at);

  return (
    <Shell user={me}>
      <Link href={`/learn/${order.courseId}`} className="text-sm text-muted hover:text-ink">← Course</Link>
      <div className="mx-auto mt-3 max-w-2xl">
        <div className="card">
          <div className="flex items-start justify-between">
            <div><h1 className="text-xl font-bold text-ink">Tax Invoice</h1><p className="font-mono text-xs text-muted">{order.no}</p></div>
            <div className="text-right text-xs text-muted">Date {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}<br />Place of supply: {order.buyerState}</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><p className="font-mono text-xs text-muted">FROM</p><b className="text-ink">{SELLER.name}</b><p className="text-muted">{SELLER.place}<br />GSTIN: {SELLER.gstin}</p></div>
            <div><p className="font-mono text-xs text-muted">BILL TO</p><b className="text-ink">{order.buyerName}</b><p className="text-muted">{order.buyerEmail}<br />{order.buyerState}{order.buyerGstin ? <><br />GSTIN: {order.buyerGstin}</> : null}</p></div>
          </div>

          <table className="mt-4 w-full border-collapse text-sm">
            <thead className="border-y border-line text-xs uppercase tracking-wide text-muted">
              <tr><th className="py-2 text-left">Description</th><th className="text-left">SAC</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="py-2 text-ink">{course?.title} {order.qty > 1 ? "(company seats)" : "(online course)"}</td>
                <td className="font-mono text-muted">{SAC}</td>
                <td className="text-right">{order.qty}</td>
                <td className="text-right">{rupees(order.rateMinor)}</td>
                <td className="text-right">{rupees(order.grossMinor)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ml-auto mt-3 max-w-xs space-y-1 text-sm">
            <Row k="Gross" v={rupees(order.grossMinor)} />
            {order.discountMinor > 0 && <Row k={`Discount${order.coupon ? ` (${order.coupon})` : ""}`} v={"− " + rupees(order.discountMinor)} />}
            <Row k="Taxable value" v={rupees(order.taxableMinor)} />
            {order.intra
              ? <><Row k="CGST 9%" v={rupees(order.cgstMinor)} /><Row k="SGST 9%" v={rupees(order.sgstMinor)} /></>
              : <Row k="IGST 18%" v={rupees(order.igstMinor)} />}
            <div className="flex justify-between border-t border-line pt-1 font-bold text-ink"><span>Total</span><span>{rupees(order.totalMinor)}</span></div>
          </div>

          <p className="mt-3 text-sm"><b>Amount in words:</b> {amountWords(order.totalMinor)}</p>
          <p className="mt-1 text-xs text-muted">Paid online via Razorpay{order.razorpayPaymentId?.startsWith("pay_sim") ? " (test, simulated)" : ""}. Computer-generated invoice.</p>
        </div>
        <div className="mt-3"><Link href={`/learn/${order.courseId}`} className="btn">Start learning</Link></div>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted">{k}</span><span className="text-ink">{v}</span></div>;
}
