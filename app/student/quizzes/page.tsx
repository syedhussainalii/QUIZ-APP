import QuizGrid from "@/components/dashboard/QuizGrid";
import Link from "next/link";

export default function StudentQuizzesPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-4 p-6">
      <Link href="/student/dashboard" className="inline-flex text-sm font-medium text-slate-300 transition hover:text-white">
        ← Back to Dashboard
      </Link>
      <QuizGrid />
    </section>
  );
}
