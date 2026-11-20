import Link from "next/link";
import { getCourses, getOutline, getBatchForCourse } from "@/lib/data";
import { createCourseAction } from "@/app/actions";
import { PageHead, Badge } from "@/components/ui";

const grads = ["from-[#141A3D] to-[#0F3DFF]", "from-[#0F3DFF] to-[#7655E8]", "from-[#7655E8] to-[#FF8A22]", "from-[#FF8A22] to-[#141A3D]", "from-[#1f9d63] to-[#0F3DFF]"];

export default async function CoursesPage() {
  const courses = await getCourses();
  const rows = await Promise.all(courses.map(async (c) => ({
    c, batch: await getBatchForCourse(c.id), n: (await getOutline(c.id)).reduce((a, ch) => a + ch.lessons.length, 0),
  })));

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Courses" sub={`${courses.length} course${courses.length === 1 ? "" : "s"} · ${courses.filter((c) => c.published).length} published`} />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(236px,1fr))]">
        {rows.map(({ c, batch, n }, i) => (
          <Link key={c.id} href={`/admin/courses/${c.id}`} className="flex flex-col overflow-hidden rounded-[15px] border border-line bg-surface hover:border-brand">
            <div className={`flex h-24 items-end bg-gradient-to-br p-3 ${grads[i % grads.length]}`}><span className="rounded-[7px] bg-white/20 px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide text-white">{c.level}</span></div>
            <div className="flex flex-1 flex-col gap-2 p-3.5">
              <h3 className="font-display text-[14.5px] font-semibold">{c.title}</h3>
              <div className="flex flex-wrap gap-3 text-[12px] text-muted"><span>{n} lessons</span>{batch && <span>{batch.name}</span>}</div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="font-display text-[15px] font-semibold">{c.priceMinor ? "₹" + c.priceMinor / 100 : "Free"}</span>
                <Badge tone={c.published ? "pub" : "draft"}>{c.published ? "Published" : "Draft"}</Badge>
              </div>
            </div>
          </Link>
        ))}
        {/* new course */}
        <form action={createCourseAction} className="flex flex-col gap-2 rounded-[15px] border border-dashed border-line bg-surface p-3.5">
          <h3 className="font-display text-[14px] font-semibold">New course</h3>
          <input name="title" required placeholder="Course title" className="field" />
          <input name="blurb" placeholder="One-line description" className="field" />
          <button className="btn mt-auto">Create course</button>
        </form>
      </div>
    </div>
  );
}
