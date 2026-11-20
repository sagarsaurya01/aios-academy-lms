import { listBatches } from "@/lib/admin-data";
import { PageHead, Badge, Tbl, Empty } from "@/components/ui";

const tone: Record<string, string> = { running: "run", upcoming: "up", completed: "done" };

export default async function BatchesPage() {
  const batches = await listBatches();
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Batches & cohorts" sub="Run a course as a dated cohort with seats, drip and live classes." />
      {batches.length === 0 ? (
        <Empty title="No batches yet" sub="Open a course and publish it as a batch with a start date and seats." cta={{ href: "/admin/courses", label: "Go to courses" }} />
      ) : (
        <Tbl head={["Batch", "Course", "Start", "Seats", "Status"]}>
          {batches.map((b) => (
            <tr key={b.id}>
              <td className="border-b border-line px-3.5 py-3 text-[13px]"><b>{b.name}</b></td>
              <td className="border-b border-line px-3.5 py-3 text-[13px]">{b.course}</td>
              <td className="border-b border-line px-3.5 py-3 text-[13px]">{b.startDate}</td>
              <td className="border-b border-line px-3.5 py-3 text-[13px] tabular-nums">{b.filled}{b.seats != null ? ` / ${b.seats}` : ""}</td>
              <td className="border-b border-line px-3.5 py-3"><Badge tone={tone[b.status]}>{b.status[0].toUpperCase() + b.status.slice(1)}</Badge></td>
            </tr>
          ))}
        </Tbl>
      )}
    </div>
  );
}
