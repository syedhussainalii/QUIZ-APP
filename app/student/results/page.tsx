import Link from "next/link";

export default function StudentResultsPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-4 p-6">
      <Link href="/student/dashboard" className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-semibold text-slate-950">My Results</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Completed quiz results are shown after each submission. Historical Supabase submissions can be connected here.
      </div>
    </section>
  );
}
