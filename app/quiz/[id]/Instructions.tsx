"use client";

import { useState } from "react";
import ProctoringModal from "./ProctoringModal";
import Link from "next/link";

interface QuizInfo {
  id: string;
  title: string;
  description: string;
  questions: number;
  duration: number;
  difficulty: string;
  category: string;
}

export default function Instructions({ quiz }: { quiz: QuizInfo }) {
  const [isChecked, setIsChecked] = useState(false);
  const [showProctoring, setShowProctoring] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-3">
            {quiz.category} • {quiz.difficulty}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
        </div>

        <div className="border-t border-b border-gray-100 dark:border-gray-800 py-6 my-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Before you begin, please review the instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><strong>Total Questions:</strong> {quiz.questions} multiple-choice questions.</li>
            <li><strong>Time Limit:</strong> You have {quiz.duration} minutes to complete the quiz once started.</li>
            <li><strong>Navigation:</strong> You can navigate between questions before final submission.</li>
            <li><strong>Integrity:</strong> Do not refresh or close the browser tab during the active session.</li>
          </ul>
        </div>

        {/* Mandatory Confirmation Checkbox */}
        <div className="flex items-start space-x-3 mb-8">
          <input
            id="terms"
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
            I have read and understood all instructions and requirements for taking this quiz.
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Back to Dashboard
          </Link>

          <button
            disabled={!isChecked}
            onClick={() => setShowProctoring(true)}
            className={`px-6 py-2.5 text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
              isChecked
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-blue-400 dark:bg-blue-800 cursor-not-allowed opacity-60"
            }`}
          >
            Begin Quiz
          </button>
          {showProctoring && (
            <ProctoringModal quizId={quiz.id} onClose={() => setShowProctoring(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
