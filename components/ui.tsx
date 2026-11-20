import Link from "next/link";

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-[22px] font-semibold">{title}</h1>{sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}</div>
      {action}
    </div>
  );
}

const tones: Record<string, string> = {
  pub: "bg-good/15 text-good", draft: "bg-sunk text-muted", run: "bg-brand-soft text-brand",
  up: "bg-orange-soft text-orange", done: "bg-sunk text-muted", risk: "bg-orange-soft text-orange",
};
export function Badge({ tone = "draft", children }: { tone?: keyof typeof tones | string; children: React.ReactNode }) {
  return <span className={`rounded-lg px-2.5 py-[3px] text-[10.5px] font-bold ${tones[tone] ?? tones.draft}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[15px] border border-line bg-surface p-4 ${className}`}>{children}</div>;
}

export function Empty({ icon, title, sub, cta }: { icon?: React.ReactNode; title: string; sub?: string; cta?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[15px] border border-dashed border-line bg-surface px-6 py-12 text-center">
      {icon && <div className="mb-1 grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</div>}
      <h3 className="font-display text-[15px] font-semibold">{title}</h3>
      {sub && <p className="max-w-sm text-[13px] text-muted">{sub}</p>}
      {cta && <Link href={cta.href} className="btn mt-2">{cta.label}</Link>}
    </div>
  );
}

export function Tbl({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[15px] border border-line bg-surface">
      <table className="w-full min-w-[560px] border-collapse">
        <thead><tr>{head.map((h) => <th key={h} className="border-b border-line px-3.5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-faint">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
