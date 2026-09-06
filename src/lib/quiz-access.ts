import { notFound, redirect } from "next/navigation";
import { quizzes as mockQuizzes } from "@/data/mockQuizzes";
import { requireRole } from "@/lib/authorization";
import { supabase } from "@/lib/supabase";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AccessibleQuiz = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: number;
  duration: number;
  attemptEndsAt?: string;
};

export async function getAccessibleQuizForStudent(id: string): Promise<AccessibleQuiz> {
  const session = await requireRole("STUDENT");

  if (!uuidPattern.test(id)) {
    const mockQuiz = mockQuizzes.find((quiz) => quiz.id === id);
    if (!mockQuiz) notFound();
    return mockQuiz;
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id,title,description,duration,is_published,start_at,due_at")
    .eq("id", id)
    .single();

  if (quizError || !quiz) notFound();
  if (!quiz.is_published) redirect("/student/quizzes");

  const { data: assignment } = await supabase
    .from("quiz_assignments")
    .select("id")
    .eq("quiz_id", id)
    .eq("student_id", session.user.id)
    .maybeSingle();

  if (!assignment) redirect("/student/quizzes");

  const now = Date.now();
  const startAt = quiz.start_at ? new Date(quiz.start_at).getTime() : null;
  const dueAt = quiz.due_at ? new Date(quiz.due_at).getTime() : null;

  if (startAt && now < startAt) redirect("/student/quizzes");
  if (dueAt && now > dueAt) redirect("/student/quizzes");

  const { data: submission } = await supabase
    .from("submissions")
    .select("id")
    .eq("quiz_id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (submission) redirect(`/quiz/${id}/results`);

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", id);

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? "",
    category: "University Assessment",
    difficulty: "Standard",
    questions: count ?? 0,
    duration: quiz.duration,
    attemptEndsAt: dueAt ? new Date(Math.min(now + quiz.duration * 60_000, dueAt)).toISOString() : undefined,
  };
}
