import { listLiveClasses } from "@/lib/admin-data";
import { PageHead, Empty } from "@/components/ui";

export default async function LivePage() {
  const all = await listLiveClasses();
  const now = Date.now();
  const upcoming = all.filter((l) => +new Date(l.startAt) >= now);
  const past = all.filter((l) => +new Date(l.startAt) < now);
  const row = (l: (typeof all)[number]) => {
    const d = new Date(l.startAt);
    return (
      <div key={l.id} className="flex items-center gap-3.5 border-t border-line py-3 first:border-t-0">
        <div className="w-[66px] shrink-0 text-center"><b className="block font-display text-[17px]">{d.getDate()}</b><span className="text-[10.5px] uppercase tracking-wide text-muted">{d.toLocaleDateString("en-IN", { month: "short" })}</span></div>
        <div className="min-w-0 flex-1"><b className="text-[13.5px]">{l.title}</b><small className="block text-[11.5px] text-muted">{l.course} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small></div>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Live classes" sub="Schedule Zoom / Meet sessions for a batch. Recordings attach back to the course." />
      {all.length === 0 ? (
        <Empty title="No live classes yet" sub="Once you schedule a session for a batch, it shows here with a join link, and the recording attaches afterward." />
      ) : (
        <div className="grid gap-[18px] lg:grid-cols-2">
          <div className="rounded-[15px] border border-line bg-surface p-4"><h2 className="mb-2 font-display text-[15.5px] font-semibold">Upcoming</h2>{upcoming.length ? upcoming.map(row) : <p className="text-[13px] text-muted">Nothing scheduled.</p>}</div>
          <div className="rounded-[15px] border border-line bg-surface p-4"><h2 className="mb-2 font-display text-[15.5px] font-semibold">Past & recordings</h2>{past.length ? past.map(row) : <p className="text-[13px] text-muted">No past sessions.</p>}</div>
        </div>
      )}
    </div>
  );
}
