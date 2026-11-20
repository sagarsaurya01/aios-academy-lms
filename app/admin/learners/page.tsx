import { listLearners } from "@/lib/admin-data";
import { PageHead, Badge, Tbl, Empty } from "@/components/ui";

const av = ["from-[#0F3DFF] to-[#7655E8]", "from-[#141A3D] to-[#0F3DFF]", "from-[#FF8A22] to-[#141A3D]", "from-[#7655E8] to-[#FF8A22]"];

export default async function LearnersPage() {
  const people = await listLearners();
  const learners = people.filter((p) => p.role === "learner");
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Learners" sub={`${learners.length} learner${learners.length === 1 ? "" : "s"} across all cohorts`} />
      {people.length === 0 ? (
        <Empty title="No learners yet" sub="When people sign up and enrol, they appear here with their course progress." />
      ) : (
        <Tbl head={["Learner", "Role", "Courses", "Progress"]}>
          {people.map((u, i) => (
            <tr key={u.id}>
              <td className="border-b border-line px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-gradient-to-br ${av[i % av.length]} text-[11px] font-bold text-white`}>{(u.name || "?").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}</span>
                  <div><b className="text-[13px]">{u.name}</b><br /><small className="text-[11px] text-muted">{u.email}</small></div>
                </div>
              </td>
              <td className="border-b border-line px-3.5 py-3"><Badge tone={u.role === "admin" ? "run" : "done"}>{u.role}</Badge></td>
              <td className="border-b border-line px-3.5 py-3 text-[13px] tabular-nums">{u.courses}</td>
              <td className="border-b border-line px-3.5 py-3 text-[13px]"><span className="mr-2 inline-block h-1.5 w-[120px] overflow-hidden rounded bg-sunk align-middle"><i className="block h-full bg-gradient-to-r from-brand to-purple" style={{ width: u.progress + "%" }} /></span>{u.progress}%</td>
            </tr>
          ))}
        </Tbl>
      )}
    </div>
  );
}
