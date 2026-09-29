"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StudentResult = {
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  tab_violations: number;
  attempt_status: "IN_PROGRESS" | "SUBMITTED" | "TERMINATED";
  termination_reason: string | null;
  submitted_at: string | null;
  name: string;
  email: string | null;
  rollNumber: string | null;
};

type QuizResult = {
  id: string;
  title: string;
  category: string | null;
  totalMarks: number;
  attempted: number;
  students: StudentResult[];
};

export default function TeacherResultsPage() {
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch("/api/teacher/results");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load results.");
        setQuizzes(data.quizzes);
        setSelectedQuizId(data.quizzes[0]?.id ?? "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load results.");
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const quiz = quizzes.find((item) => item.id === selectedQuizId);

  return (
    <section className="mx-auto max-w-7xl space-y-5 p-6">
      <Link href="/teacher/dashboard" className="inline-flex text-sm font-medium text-slate-300 transition hover:text-white">
        ← Back to Dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-white">Results</h1>
        <p className="mt-1 text-sm text-slate-400">Review performance for quizzes you created.</p>
      </div>

      {error && <p className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-200">{error}</p>}
      {loading && <p className="text-sm text-slate-400">Loading results…</p>}

      {!loading && !error && quizzes.length === 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">No quizzes found.</div>
      )}

      {quizzes.length > 0 && (
        <>
          <label className="block max-w-xl text-sm font-medium text-slate-300">
            Select test
            <select value={selectedQuizId} onChange={(event) => setSelectedQuizId(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white">
              {quizzes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>

          {quiz && <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Quiz" value={quiz.title} />
              <Metric label="Total marks" value={quiz.totalMarks} />
              <Metric label="Students attempted" value={quiz.attempted} />
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-400"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Percentage</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Proctoring</th></tr></thead>
                <tbody>{quiz.students.length ? quiz.students.map((student) => <tr key={student.user_id} className="border-b border-slate-800/70 text-slate-200"><td className="px-4 py-3"><p>{student.name}</p><p className="text-xs text-slate-400">{student.email ?? student.rollNumber ?? "No ID available"}</p></td><td className="px-4 py-3">{student.score} / {student.total_questions || quiz.totalMarks}</td><td className="px-4 py-3">{student.percentage}%</td><td className="px-4 py-3">{student.passed ? "Pass" : "Fail"}</td><td className="px-4 py-3">{student.attempt_status}</td><td className="px-4 py-3">{student.termination_reason ? "Tab-switch violation" : student.tab_violations ? "Violation recorded" : "Clear"}</td></tr>) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No students have attempted this test.</td></tr>}</tbody>
              </table>
            </div>
          </>}
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-900 p-4"><p className="text-xs uppercase text-slate-400">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></div>;
}
