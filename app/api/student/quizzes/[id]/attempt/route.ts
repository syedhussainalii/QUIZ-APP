import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSupabase } from "@/lib/server-supabase";

type Context = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Context) {
  const session = await getServerSession(authOptions);
  const { id: quizId } = await params;

  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { data: quiz, error: quizError } = await serverSupabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .maybeSingle();

  if (quizError || !quiz) {
    return NextResponse.json({ message: "Quiz not found." }, { status: 404 });
  }

  const { count, error: questionError } = await serverSupabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  if (questionError) {
    return NextResponse.json({ message: "Could not prepare this quiz." }, { status: 500 });
  }

  const attemptId = crypto.randomUUID();
  const baseAttempt = {
    id: attemptId,
    user_id: session.user.id,
    quiz_id: quizId,
    student_name: session.user.name ?? session.user.email ?? "Student",
    score: 0,
    total_questions: count ?? 0,
    percentage: 0,
    passed: false,
    tab_switch_count: 0,
    tab_violations: 0,
  };
  const { data, error } = await serverSupabase.from("submissions").insert({
    ...baseAttempt,
    attempt_status: "IN_PROGRESS",
    started_at: new Date().toISOString(),
  }).select("id").maybeSingle();

  if (error?.code === "23505") {
    return NextResponse.json({ message: "You have already attempted this test." }, { status: 409 });
  }

  // The migration may have stopped at its unique-index statement, rolling back
  // the preceding ALTER TABLE statements. Keep the existing database usable
  // without touching historical records. The normal status/index path above is
  // used automatically once the migration has completed successfully.
  if (error?.code === "PGRST204") {
    const { data: existing, error: existingError } = await serverSupabase
      .from("submissions")
      .select("id")
      .eq("quiz_id", quizId)
      .eq("user_id", session.user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ message: "Could not check previous attempts." }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ message: "You have already attempted this test." }, { status: 409 });
    }

    const { data: legacyAttempt, error: legacyError } = await serverSupabase
      .from("submissions")
      .insert(baseAttempt)
      .select("id")
      .maybeSingle();

    if (legacyError || !legacyAttempt) {
      return NextResponse.json({ message: "Could not start this test." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, attemptId: legacyAttempt.id, legacyMode: true });
  }

  if (error) {
    return NextResponse.json({ message: "Could not start this test." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, attemptId: data?.id });
}
