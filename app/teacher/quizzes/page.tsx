import { quizzes } from "@/data/mockQuizzes";

export default function TeacherQuizzesPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Quizzes</h1>
      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <article key={quiz.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-950">{quiz.title}</h2>
                <p className="text-sm text-slate-600">{quiz.description}</p>
              </div>
              <span className="rounded-md bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Published
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
