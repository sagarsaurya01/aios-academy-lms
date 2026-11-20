import { getAnalytics } from "@/lib/admin-data";
import { PageHead, Card } from "@/components/ui";

export default async function AnalyticsPage() {
  const a = await getAnalytics();
  const tiles = [
    { label: "Completion rate", value: a.completion + "%" },
    { label: "Certificates issued", value: String(a.certificates) },
    { label: "Total enrollments", value: String(a.enrolments) },
    { label: "B2B share", value: a.b2bPct + "%" },
  ];
  const sources = [
    { label: "Individual learners", pct: a.individualPct, accent: "blue" as const },
    { label: "Company seats (B2B)", pct: a.b2bPct, accent: "orange" as const },
  ];
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Analytics" sub="Engagement, completion and revenue — one connected view." />
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}><div className="text-[12px] text-muted">{t.label}</div><div className="mt-1 font-display text-[25px] font-semibold tabular-nums">{t.value}</div></Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-display text-[15.5px] font-semibold">Enrollment sources</h2>
        {sources.map((s) => (
          <div key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-line py-2.5 first:border-t-0">
            <div className="text-[13.5px] font-semibold">{s.label}</div>
            <div className="text-right text-[13px] font-semibold tabular-nums">{s.pct}%</div>
            <div className="col-span-2 h-1.5 overflow-hidden rounded bg-sunk"><i className={`block h-full ${s.accent === "orange" ? "bg-gradient-to-r from-orange to-[#ffb774]" : "bg-gradient-to-r from-brand to-purple"}`} style={{ width: Math.max(2, s.pct) + "%" }} /></div>
          </div>
        ))}
        <p className="mt-3 text-[12px] text-muted">More charts (cohort engagement, revenue by month, assessment performance) fill in as the academy grows.</p>
      </Card>
    </div>
  );
}
