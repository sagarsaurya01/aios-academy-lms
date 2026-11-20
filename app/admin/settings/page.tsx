import { PageHead, Card } from "@/components/ui";

export default function SettingsPage() {
  const gstin = process.env.NEXT_PUBLIC_ACADEMY_GSTIN || "19ABCFA0000A1Z0";
  const state = process.env.NEXT_PUBLIC_ACADEMY_STATE || "West Bengal";
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Settings" sub="Academy, tax and payment configuration." />
      <div className="grid gap-[18px] lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-[15.5px] font-semibold">Academy</h2>
          <div className="mb-3.5"><div className="label">Academy name</div><input defaultValue="AI OS Academy" className="field" /></div>
          <div className="mb-3.5"><div className="label">Legal entity</div><input defaultValue="Aikigai Edtech LLP" className="field" /></div>
          <div><div className="label">Support email</div><input defaultValue="learn@aikigai.ai" className="field" /></div>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-[15.5px] font-semibold">Tax &amp; payments</h2>
          <div className="mb-3.5"><div className="label">GSTIN</div><input defaultValue={gstin} className="field" /></div>
          <div className="mb-3.5"><div className="label">Place of supply</div><input defaultValue={state} className="field" /></div>
          <div><div className="label">Payment gateway</div><select className="field" defaultValue="razorpay"><option value="razorpay">Razorpay (test — add keys to enable)</option></select></div>
        </Card>
      </div>
      <p className="text-[12px] text-muted">Saving settings to the database is on the roadmap. GSTIN and place of supply are read from your environment and already drive the GST invoices.</p>
    </div>
  );
}
