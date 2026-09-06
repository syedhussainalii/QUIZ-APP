"use client";

import { useState } from "react";
import Link from "next/link";

export default function Results({ quizId }: { quizId: string }) {
  const [result] = useState(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(`quiz-${quizId}-result`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  });


  if (!result) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Quiz Results</h1>
      <p className="text-lg mb-2 text-gray-800 dark:text-gray-200">
        Score: {result.score} / {result.total}
      </p>
      <p className="text-lg mb-2 text-gray-800 dark:text-gray-200">
        Percentage: {result.percentage}%
      </p>
      <p className={`text-lg font-semibold ${result.passed ? "text-green-600" : "text-red-600"}`}>
        {result.passed ? "Passed 🎉" : "Failed 😞"}
      </p>
      <Link
        href="/student/dashboard"
        className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
      >
        Return to Dashboard
      </Link>
    </section>
  );
}
