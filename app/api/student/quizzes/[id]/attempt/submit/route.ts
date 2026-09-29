import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSupabase } from "@/lib/server-supabase";

type Context = { params: Promise<{ id: string }> };
type SubmitBody = { answers?: Record<string, number>; terminated?: boolean; attemptId?: string };

export async function POST(request: Request, { params }: Context) {
  const session = await getServerSession(authOptions);
  const { id: quizId } = await params;

  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid submission." }, { status: 400 });
  }

  const answers = body.answers ?? {};
  const { data: questions, error: questionsError } = await serverSupabase
    .from("questions")
    .select("id,correct_option_index")
    .eq("quiz_id", quizId);

  if (questionsError || !questions) {
    return NextResponse.json({ message: "Could not grade this test." }, { status: 500 });
  }

  const score = questions.reduce(
    (total, question) => total + (answers[question.id] === question.correct_option_index ? 1 : 0),
    0,
  );
  const totalQuestions = questions.length;
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const terminated = body.terminated === true;

  const finalSubmission = {
    score,
    total_questions: totalQuestions,
    percentage,
    passed: percentage >= 50,
    tab_switch_count: terminated ? 1 : 0,
    tab_violations: terminated ? 1 : 0,
    submitted_at: new Date().toISOString(),
  };
  const { data, error } = await serverSupabase
    .from("submissions")
    .update({
      ...finalSubmission,
      attempt_status: terminated ? "TERMINATED" : "SUBMITTED",
      termination_reason: terminated ? "TAB_SWITCH_OR_WINDOW_BLUR" : null,
    })
    .eq("quiz_id", quizId)
    .eq("user_id", session.user.id)
    .eq("attempt_status", "IN_PROGRESS")
    .select("id")
    .maybeSingle();

  if (error?.code === "PGRST204" && body.attemptId) {
    const { data: legacyAttempt, error: legacyError } = await serverSupabase
      .from("submissions")
      .update(finalSubmission)
      .eq("id", body.attemptId)
      .eq("quiz_id", quizId)
      .eq("user_id", session.user.id)
      .select("id")
      .maybeSingle();

    if (!legacyError && legacyAttempt) {
      return NextResponse.json({ score, totalQuestions, percentage, passed: percentage >= 50, terminated });
    }
  }

  if (error || !data) {
    return NextResponse.json({ message: "This test has already been ended." }, { status: 409 });
  }

  return NextResponse.json({
    score,
    totalQuestions,
    percentage,
    passed: percentage >= 50,
    terminated,
  });
}
