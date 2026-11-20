import { listCertificates } from "@/lib/admin-data";
import { PageHead, Empty } from "@/components/ui";

export default async function CertificatesPage() {
  const certs = await listCertificates();
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Certificates" sub="Issued automatically when a learner completes a course and passes. Verifiable, LinkedIn-ready." />
      {certs.length === 0 ? (
        <Empty title="No certificates issued yet" sub="When a learner finishes all lessons and passes the quiz, their certificate is issued and listed here." />
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(236px,1fr))]">
          {certs.map((c) => (
            <div key={c.certNo} className="overflow-hidden rounded-[13px] border border-line bg-surface">
              <div className="flex h-[92px] flex-col justify-between bg-gradient-to-br from-[#141A3D] to-[#0F3DFF] p-3.5 text-white">
                <div className="font-display text-[13px] font-semibold">Certificate of Completion</div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="self-end"><circle cx="12" cy="9" r="5" /><path d="M9 14l-2 7 5-3 5 3-2-7" /></svg>
              </div>
              <div className="flex flex-col gap-0.5 p-3.5"><b className="text-[13.5px]">{c.learner}</b><small className="text-[11.5px] text-muted">{c.course}</small><small className="text-[11.5px] text-muted">{c.certNo} · {new Date(c.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</small></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
