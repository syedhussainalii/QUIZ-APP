import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSupabase } from "@/lib/server-supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { data: quizzes, error: quizzesError } = await serverSupabase
    .from("quizzes")
    .select("id,title,category,created_at")
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false });

  if (quizzesError || !quizzes) {
    return NextResponse.json({ message: "Could not load quizzes." }, { status: 500 });
  }

  const quizIds = quizzes.map((quiz) => quiz.id);
  if (!quizIds.length) return NextResponse.json({ quizzes: [] });

  const [{ data: submissions, error: submissionsError }, { data: questions, error: questionsError }] = await Promise.all([
    serverSupabase
      .from("submissions")
      .select("id,user_id,quiz_id,score,total_questions,percentage,passed,tab_violations,submitted_at,student_name")
      .in("quiz_id", quizIds),
    serverSupabase.from("questions").select("id,quiz_id").in("quiz_id", quizIds),
  ]);

  if (submissionsError || questionsError) {
    return NextResponse.json({ message: "Could not load performance data." }, { status: 500 });
  }

  // The proctoring fields are optional until the migration is completed. Read
  // them separately so ordinary historical results continue to work.
  const { data: proctoringRows, error: proctoringError } = await serverSupabase
    .from("submissions")
    .select("id,attempt_status,termination_reason")
    .in("quiz_id", quizIds);

  if (proctoringError && proctoringError.code !== "PGRST204" && proctoringError.code !== "42703") {
    return NextResponse.json({ message: "Could not load proctoring data." }, { status: 500 });
  }

  const proctoringBySubmissionId = new Map(
    (proctoringRows ?? []).map((submission) => [submission.id, submission]),
  );

  const userIds = [...new Set((submissions ?? []).map((submission) => submission.user_id).filter(Boolean))];
  const { data: users, error: usersError } = userIds.length
    ? await serverSupabase.from("users").select("id,name,email").in("id", userIds)
    : { data: [], error: null };

  if (usersError) {
    return NextResponse.json({ message: "Could not load student details." }, { status: 500 });
  }

  const usersById = new Map((users ?? []).map((user) => [user.id, user]));
  const results = quizzes.map((quiz) => {
    const quizSubmissions = (submissions ?? []).filter((submission) => submission.quiz_id === quiz.id);
    // Some historical data predates the single-attempt rule. Count each student
    // once and show that student's latest recorded attempt.
    const latestByStudent = new Map<string, (typeof quizSubmissions)[number]>();
    for (const submission of quizSubmissions) {
      const previous = latestByStudent.get(submission.user_id);
      if (!previous || (submission.submitted_at ?? "") > (previous.submitted_at ?? "")) {
        latestByStudent.set(submission.user_id, submission);
      }
    }
    const studentAttempts = [...latestByStudent.values()];
    const totalMarks = (questions ?? []).filter((question) => question.quiz_id === quiz.id).length;

    return {
      ...quiz,
      totalMarks,
      attempted: studentAttempts.length,
      students: studentAttempts.map((submission) => ({
        ...submission,
        attempt_status: proctoringBySubmissionId.get(submission.id)?.attempt_status ?? "SUBMITTED",
        termination_reason: proctoringBySubmissionId.get(submission.id)?.termination_reason ?? null,
        name: usersById.get(submission.user_id)?.name ?? submission.student_name ?? "Student",
        email: usersById.get(submission.user_id)?.email ?? null,
        rollNumber: null,
      })),
    };
  });

  return NextResponse.json({ quizzes: results });
}
