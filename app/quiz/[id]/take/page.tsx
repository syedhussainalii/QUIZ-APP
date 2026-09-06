import QuizTake from "../QuizTake";
import { getAccessibleQuizForStudent } from "@/lib/quiz-access";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `${id} | Quiz`,
    description: "Quiz",
  };
}

export default async function TakePage({ params }: PageProps) {
  const { id } = await params;
  const quiz = await getAccessibleQuizForStudent(id);
  return <QuizTake quiz={quiz} />;
}
