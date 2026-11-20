import Link from "next/link";
import { getDashboard } from "@/lib/admin-data";

const ic: Record<string, React.ReactNode> = {
  money: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  count: <><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14v7M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" /></>,
  live: <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></>,
};
const pin = (k: string) => {
  const map: Record<string, { cls: string; d: React.ReactNode }> = {
    enrol: { cls: "bg-good/15 text-good", d: <path d="M20 6L9 17l-5-5" /> },
    order: { cls: "bg-brand-soft text-brand", d: <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></> },
    cert: { cls: "bg-good/15 text-good", d: <><circle cx="12" cy="9" r="5" /><path d="M9 14l-2 7 5-3 5 3-2-7" /></> },
    seat: { cls: "bg-orange-soft text-orange", d: <path d="M3 21V8l9-5 9 5v13" /> },
  };
  return map[k] ?? map.order;
};

export default async function Dashboard() {
  const d = await getDashboard();
  const W = 560, H = 190, n = d.chart.revenue.length;
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * W : 0);
  const yR = (v: number) => 170 - (v / d.chart.maxRev) * 150;
  const maxE = Math.max(1, ...d.chart.enrol);
  const yE = (v: number) => 180 - (v / maxE) * 150;
  const line = d.chart.revenue.map((v, i) => `${i ? "L" : "M"}${x(i)},${yR(v)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const eline = d.chart.enrol.map((v, i) => `${i ? "L" : "M"}${x(i)},${yE(v)}`).join(" ");

  return (
    <div className="flex flex-col gap-[18px]">
      {/* tiles */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {d.tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-2 rounded-[15px] border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className={`grid h-[34px] w-[34px] place-items-center rounded-[10px] ${t.kind === "live" ? "bg-orange-soft text-orange" : "bg-brand-soft text-brand"}`}>
                <svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" className="h-[17px] w-[17px] stroke-current">{ic[t.kind ?? "count"]}</svg>
              </span>
              {t.delta && <span className="rounded-[7px] bg-sunk px-[7px] py-0.5 text-[11.5px] font-semibold text-muted">{t.delta}</span>}
            </div>
            <div className="text-[12px] text-muted">{t.label}</div>
            <div className="font-display text-[25px] font-semibold tracking-tight tabular-nums">{t.value}</div>
          </div>
        ))}
      </div>

      {/* chart + calendar */}
      <div className="grid gap-[18px] lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 rounded-[15px] border border-line bg-surface p-4">
          <header className="mb-3.5 flex items-center justify-between">
            <div><h2 className="font-display text-[15.5px] font-semibold">Revenue &amp; enrollments</h2><div className="text-[11.5px] text-faint">{d.chart.months[0]} – {d.chart.months[n - 1]}</div></div>
            <Link href="/admin/analytics" className="text-[12.5px] font-semibold text-brand">View report →</Link>
          </header>
          <svg viewBox="0 0 560 190" preserveAspectRatio="none" className="h-[190px] w-full" role="img" aria-label="Revenue trend">
            <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F3DFF" stopOpacity="0.30" /><stop offset="1" stopColor="#0F3DFF" stopOpacity="0" /></linearGradient></defs>
            <g stroke="#e6e1d2" strokeWidth="1"><line x1="0" y1="30" x2="560" y2="30" /><line x1="0" y1="75" x2="560" y2="75" /><line x1="0" y1="120" x2="560" y2="120" /><line x1="0" y1="165" x2="560" y2="165" /></g>
            <path d={area} fill="url(#rg)" />
            <path d={line} fill="none" stroke="#0F3DFF" strokeWidth="2.6" strokeLinejoin="round" />
            <path d={eline} fill="none" stroke="#FF8A22" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
          <div className="mt-2 flex gap-4 text-[11.5px] text-muted">
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-brand" />Revenue</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-orange" />Enrollments</span>
          </div>
        </div>

        <div className="rounded-[15px] border border-line bg-surface p-4">
          <header className="mb-3.5"><h2 className="font-display text-[15.5px] font-semibold">{d.monthName}</h2><div className="text-[11.5px] text-faint">{d.liveToday.length} live {d.liveToday.length === 1 ? "class" : "classes"} today</div></header>
          <div className="grid grid-cols-7 gap-[3px] text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((x, i) => <div key={i} className="pb-1 text-[10px] text-faint">{x}</div>)}
            {d.calendar.map((c, i) => (
              <div key={i} className={`relative rounded-lg py-1.5 text-[12px] tabular-nums ${c.today ? "bg-brand font-bold text-white" : c.muted ? "text-faint" : "text-fg"}`}>
                {c.day}{c.has && !c.today && <span className="absolute bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange" />}
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-2.5">
            {d.liveToday.length ? d.liveToday.map((l, i) => (
              <div key={i} className="flex gap-2.5 py-1.5"><span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-brand-soft text-brand"><svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" className="h-[15px] w-[15px] stroke-current"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></svg></span><p className="m-0 text-[12.5px]"><b>{l.title}</b><br /><span className="text-[11px] text-faint">Today · {l.at}</span></p></div>
            )) : <p className="py-1 text-[12px] text-muted">No live classes scheduled today. <Link href="/admin/live" className="font-semibold text-brand">Schedule one →</Link></p>}
          </div>
        </div>
      </div>

      {/* top courses + activity */}
      <div className="grid gap-[18px] lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 rounded-[15px] border border-line bg-surface p-4">
          <header className="mb-3.5 flex items-center justify-between"><div><h2 className="font-display text-[15.5px] font-semibold">Top performing courses</h2><div className="text-[11.5px] text-faint">By enrollments &amp; completion</div></div><Link href="/admin/courses" className="text-[12.5px] font-semibold text-brand">All courses →</Link></header>
          {d.topCourses.length ? d.topCourses.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-line py-2.5 first:border-t-0">
              <div><div className="text-[13.5px] font-semibold">{c.title}</div><div className="text-[11.5px] text-muted">{c.learners} learners · {c.completion}% completion</div></div>
              <div className="text-right text-[13px] font-semibold tabular-nums">{c.revenue}</div>
              <div className="col-span-2 h-1.5 overflow-hidden rounded bg-sunk"><i className={`block h-full ${c.accent === "orange" ? "bg-gradient-to-r from-orange to-[#ffb774]" : "bg-gradient-to-r from-brand to-purple"}`} style={{ width: Math.max(4, c.completion) + "%" }} /></div>
            </div>
          )) : <p className="text-[13px] text-muted">No course activity yet.</p>}
        </div>

        <div className="rounded-[15px] border border-line bg-surface p-4">
          <header className="mb-3.5 flex items-center justify-between"><h2 className="font-display text-[15.5px] font-semibold">Recent activity</h2></header>
          {d.activity.length ? d.activity.map((e, i) => {
            const p = pin(e.kind);
            return <div key={i} className="flex gap-2.5 py-2.5"><span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] ${p.cls}`}><svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" className="h-[15px] w-[15px] stroke-current">{p.d}</svg></span><p className="m-0 text-[12.5px] leading-snug">{e.text}<br /><span className="text-[11px] text-faint">{e.when}</span></p></div>;
          }) : <p className="text-[13px] text-muted">Activity will appear here as learners enrol and pay.</p>}
        </div>
      </div>
    </div>
  );
}
