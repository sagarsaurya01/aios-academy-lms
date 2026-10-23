import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getCourse, getCert, courseLessons } from "@/lib/data";

export default function CertPage({ params }: { params: { id: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  const course = getCourse(params.id);
  if (!course) notFound();
  const cert = getCert(me.id, course.id);
  if (!cert) redirect(`/learn/${course.id}`);

  const d = new Date(cert.issuedAt);
  const li = "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME"
    + "&name=" + encodeURIComponent(course.title)
    + "&organizationName=" + encodeURIComponent("AI OS Academy")
    + "&issueYear=" + d.getFullYear() + "&issueMonth=" + (d.getMonth() + 1) + "&certId=" + cert.certNo;

  return (
    <Shell user={me}>
      <Link href={`/learn/${course.id}`} className="text-sm text-muted hover:text-ink">← {course.title}</Link>
      <div className="mx-auto mt-4 max-w-2xl">
        <div className="card border-brand text-center" style={{ borderWidth: 2 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Certificate of Completion</p>
          <p className="mt-6 text-sm text-muted">This certifies that</p>
          <p className="my-1 text-3xl font-bold text-ink">{me.name}</p>
          <p className="text-sm text-muted">has completed</p>
          <h2 className="mt-1 text-xl font-bold text-brand">{course.title}</h2>
          <p className="mt-3 text-xs text-muted">{courseLessons(course.id).length} lessons · Issued {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
          <p className="mt-4 font-mono text-xs text-muted">ID {cert.certNo} · Aikigai Edtech LLP</p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <a className="btn" href={li} target="_blank" rel="noopener">Add to LinkedIn</a>
          <span className="text-xs text-muted">Anyone can verify the ID on our site (planned).</span>
        </div>
      </div>
    </Shell>
  );
}
