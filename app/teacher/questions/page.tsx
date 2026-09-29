import Link from "next/link";

export default function QuestionBankPage() {
  return <ProtectedTeacherPanel title="Question Bank" description="Create, edit, and delete reusable questions." />;
}

function ProtectedTeacherPanel({ title, description }: { title: string; description: string }) {
  return (
    <section className="mx-auto max-w-7xl space-y-4 p-6">
      <Link href="/teacher/dashboard" className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">{description}</div>
    </section>
  );
}
