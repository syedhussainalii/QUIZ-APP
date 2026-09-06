import Results from "../Results";
import { requireRole } from "@/lib/authorization";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizResultsPage({ params }: PageProps) {
  await requireRole("STUDENT");
  const { id } = await params;

  return (
    <div className="p-6">
      <Results quizId={id} />
    </div>
  );
}
