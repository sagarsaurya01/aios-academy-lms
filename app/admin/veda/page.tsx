import { PageHead, Card, Badge } from "@/components/ui";

const feats = [
  { t: "AI Companion", d: "An always-on tutor for every learner — explains concepts, summarises lessons and answers course questions." },
  { t: "AI Interviewer", d: "Role-based mock interviews so learners practise for real job scenarios, repeatably and at scale." },
  { t: "Assessment Generator", d: "Create quizzes and practice tests from any topic or lesson with one click." },
  { t: "Assessment Evaluator", d: "Auto-evaluate submissions with feedback and performance insights in seconds." },
  { t: "Drop-off Prediction", d: "Spot learners at risk from attendance and engagement signals before they fall behind." },
];

export default function VedaPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <PageHead title="Veda AI" sub="Context-aware AI across your academy — tutor, marking and risk insights." action={<Badge tone="up">Coming soon</Badge>} />
      <Card>
        <h2 className="mb-1 font-display text-[15.5px] font-semibold">Your AI layer</h2>
        <p className="mb-3 text-[13px] text-muted">These run on your academy&apos;s own context — learners, content, assessments and engagement. They&apos;re on the Phase 3 roadmap; the hooks are built, the models get wired next.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {feats.map((f) => (
            <div key={f.t} className="rounded-[13px] border border-line bg-sunk/40 p-3.5">
              <div className="mb-1 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand"><svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" className="h-4 w-4 stroke-current"><circle cx="13" cy="11" r="8" /><path d="M13 7v4l3 2" /></svg></span><b className="text-[13.5px]">{f.t}</b></div>
              <p className="text-[12.5px] text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
