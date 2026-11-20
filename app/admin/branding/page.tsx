import { PageHead, Card } from "@/components/ui";

const swatches = [
  ["Navy", "#141A3D"], ["Cream", "#F6F4EB"], ["Blue", "#0F3DFF"], ["Orange", "#FF8A22"], ["Purple", "#7655E8"], ["Green", "#39D98A"],
];

export default function BrandingPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Branding" sub="Your white-labelled academy — logo, colours, fonts and custom domain." />
      <Card>
        <h2 className="mb-3 font-display text-[15.5px] font-semibold">Logo &amp; identity</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-[13px] bg-[#141A3D] px-[18px] py-3.5">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <defs><linearGradient id="bL" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#141A3D" /><stop offset="0.5" stopColor="#0F3DFF" /><stop offset="1" stopColor="#7655E8" /></linearGradient><linearGradient id="bR" x1="1" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#141A3D" /><stop offset="0.55" stopColor="#FF8A22" /><stop offset="1" stopColor="#ffd0a3" /></linearGradient></defs>
              <path d="M20 4 C11 8 5 13 5 20 C5 27 12 33 20 36.5" stroke="url(#bL)" strokeWidth="3.4" strokeLinecap="round" /><path d="M20 4 C29 8 35 13 35 20 C35 27 28 33 20 36.5" stroke="url(#bR)" strokeWidth="3.4" strokeLinecap="round" />
            </svg>
            <b className="font-display text-[17px] text-white">AI OS Academy</b>
          </div>
          <div><div className="label">Custom domain</div><input defaultValue="learn.aikigai.ai" readOnly className="field" /></div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-[15.5px] font-semibold">Brand colours</h2>
        <div className="flex flex-wrap gap-3">
          {swatches.map(([name, hex]) => (
            <div key={hex} className="w-[92px]"><div className="h-[58px] rounded-[11px] border border-black/5" style={{ background: hex }} /><b className="mt-1.5 block text-[12px]">{name}</b><small className="text-[11px] tabular-nums text-muted">{hex}</small></div>
          ))}
        </div>
      </Card>
      <div className="grid gap-[18px] lg:grid-cols-2">
        <Card><small className="text-muted">Headings</small><div className="font-display text-[28px] font-semibold">Chillax</div><small className="text-muted">AaBbCc 0123 — Making Business AI Native</small></Card>
        <Card><small className="text-muted">Body</small><div className="text-[28px] font-semibold">Satoshi</div><small className="text-muted">AaBbCc 0123 — the quick brown fox</small></Card>
      </div>
    </div>
  );
}
