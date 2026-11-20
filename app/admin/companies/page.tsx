import { listOrgs } from "@/lib/admin-data";
import { PageHead, Empty } from "@/components/ui";

export default async function CompaniesPage() {
  const orgs = await listOrgs();
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Companies · B2B seats" sub="Businesses buy seats in bulk (one GST invoice) and assign them to staff." />
      {orgs.length === 0 ? (
        <Empty title="No companies yet" sub="When a business buys seats in bulk at checkout, it appears here with seat usage and its GST invoice." />
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(236px,1fr))]">
          {orgs.map((o) => (
            <div key={o.id} className="flex flex-col gap-3 rounded-[15px] border border-line bg-surface p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-brand to-purple font-display font-bold text-white">{o.name.slice(0, 2).toUpperCase()}</span>
                <div><b>{o.name}</b>{o.gstin && <div className="text-[11px] tabular-nums text-muted">GSTIN {o.gstin}</div>}</div>
              </div>
              <div className="flex justify-between text-[12px] text-muted"><span>Seats used</span><b className="tabular-nums text-fg">{o.used} / {o.seats}</b></div>
              <div className="h-1.5 overflow-hidden rounded bg-sunk"><i className="block h-full bg-gradient-to-r from-brand to-purple" style={{ width: (o.seats ? (o.used / o.seats) * 100 : 0) + "%" }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
