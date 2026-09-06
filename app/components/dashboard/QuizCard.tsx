"use client";

import { useState } from "react";
import Link from "next/link";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description?: string | null;
    category?: string;
    difficulty?: string;
    questions?: number;
    duration?: number;
    duration_minutes?: number;
    due_date?: string;
    [key: string]: unknown;
  };
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const [now] = useState(() => Date.now());
  const startAt = typeof quiz.start_at === "string" ? new Date(quiz.start_at).getTime() : null;
  const dueDate = quiz.due_date ?? quiz.due_at;
  const dueAt = typeof dueDate === "string" ? new Date(dueDate).getTime() : null;
  const status = startAt && now < startAt ? "UPCOMING" : dueAt && now > dueAt ? "EXPIRED" : "AVAILABLE";
  const countdownLabel =
    status === "UPCOMING" && startAt
      ? `Starts in: ${formatCountdown(startAt - now)}`
      : status === "AVAILABLE" && dueAt
        ? `Due in: ${formatCountdown(dueAt - now)}`
        : status === "EXPIRED"
          ? "Deadline passed"
          : "Open for assigned students";

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{quiz.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{status}</span>
          <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">{countdownLabel}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{quiz.category || "General"}</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{quiz.difficulty || "Standard"}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>{quiz.questions || 10} Questions</span>
          <span>{quiz.duration_minutes || quiz.duration || 15} Minutes</span>
        </div>
      </div>
      {status === "AVAILABLE" ? (
        <Link
          href={`/student/quiz/${quiz.id}`}
          className="mt-2 w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md py-2"
        >
          Start Quiz
        </Link>
      ) : (
        <span className="mt-2 w-full rounded-md bg-gray-200 py-2 text-center text-sm font-medium text-gray-600">
          {status === "UPCOMING" ? "Not started" : "Expired"}
        </span>
      )}
    </div>
  );
}

function formatCountdown(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}
