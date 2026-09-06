"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QuizCard from "@/components/dashboard/QuizCard";

type Quiz = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration_minutes?: number;
  duration?: number;
  due_date?: string;
};

export default function QuizGrid() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg bg-slate-900 p-6 text-center text-slate-300">
        Loading active quizzes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 p-4 text-sm text-red-400">
        Could not load quizzes: {error}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        No quizzes available right now. Check back later!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Available Quizzes</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={{
              id: quiz.id,
              title: quiz.title,
              category: quiz.category,
              difficulty: quiz.difficulty,
              duration_minutes: quiz.duration_minutes,
              due_date: quiz.due_date,
            }}
          />
        ))}
      </div>
    </div>
  );
}
