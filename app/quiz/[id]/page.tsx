import Instructions from "./Instructions";
import { getAccessibleQuizForStudent } from "@/lib/quiz-access";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `${id} | Quiz Platform`,
    description: "Quiz details",
  };
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  const quiz = await getAccessibleQuizForStudent(id);

  return <Instructions quiz={quiz} />;
}
