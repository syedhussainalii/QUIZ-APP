import Link from "next/link";

export default function StudentsPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-4 p-6">
      <Link href="/teacher/dashboard" className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-semibold text-slate-950">Students</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Assign up to 10 students per quiz and review enrollment details.
      </div>
    </section>
  );
}
