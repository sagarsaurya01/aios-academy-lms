import { listAssessments } from "@/lib/admin-data";
import { PageHead, Badge, Tbl, Empty } from "@/components/ui";

export default async function AssessmentsPage() {
  const a = await listAssessments();
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Assessments" sub="Quizzes & assignments — auto-scored, with AI marking planned (Veda AI)." />
      {a.length === 0 ? (
        <Empty title="No assessments yet" sub="Add a quiz lesson inside a course and it will appear here with submissions and average score." cta={{ href: "/admin/courses", label: "Go to courses" }} />
      ) : (
        <Tbl head={["Assessment", "Course", "Submissions", "Avg score", "Marking"]}>
          {a.map((x) => (
            <tr key={x.id}>
              <td className="border-b border-line px-3.5 py-3 text-[13px]"><b>{x.title}</b></td>
              <td className="border-b border-line px-3.5 py-3 text-[13px]">{x.course}</td>
              <td className="border-b border-line px-3.5 py-3 text-[13px] tabular-nums">{x.submissions}</td>
              <td className="border-b border-line px-3.5 py-3 text-[13px] tabular-nums">{x.avg}</td>
              <td className="border-b border-line px-3.5 py-3"><Badge tone="run">Auto</Badge></td>
            </tr>
          ))}
        </Tbl>
      )}
    </div>
  );
}
