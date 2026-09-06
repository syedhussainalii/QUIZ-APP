"use client";

import { mockQuestions } from "@/data/mockQuestions";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

// Simple type definition matching mock quiz
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: number; // number of questions
  duration: number; // minutes
  attemptEndsAt?: string;
}

interface QuizTakeProps {
  quiz: Quiz;
}

export default function QuizTake({ quiz }: QuizTakeProps) {
  const router = useRouter();
  const total = quiz.questions;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load mock questions for this quiz
  const questions = useMemo(() => mockQuestions[quiz.id] ?? [], [quiz.id]);

  // -------------------- Persistence --------------------
  // Lazy load persisted state (runs once)
  const storageKey = `quiz-${quiz.id}-state`;

  const getPersistedState = () => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  };

  const persisted = getPersistedState();

  const [currentIdx, setCurrentIdx] = useState<number>(persisted?.currentIdx ?? 0);
  const [answers, setAnswers] = useState<Record<number, number>>(persisted?.answers ?? {});
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const maxAttemptSeconds = quiz.attemptEndsAt
      ? Math.max(0, Math.floor((new Date(quiz.attemptEndsAt).getTime() - Date.now()) / 1000))
      : quiz.duration * 60;
    const initialSeconds = Math.min(quiz.duration * 60, maxAttemptSeconds);
    return Math.min(persisted?.secondsLeft ?? initialSeconds, initialSeconds);
  });
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(persisted?.tabSwitchCount ?? 0);
  const [showWarning, setShowWarning] = useState(false);

  // Persist state whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = { currentIdx, answers, secondsLeft, tabSwitchCount };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    }
  }, [currentIdx, answers, secondsLeft, tabSwitchCount, storageKey]);

  // Submit handler (defined before timer effect)
  const handleSubmit = useCallback(() => {
    const correctAnswers = questions.map((q) => q.correctAnswer);
    let score = 0;
    correctAnswers.forEach((ca, idx) => {
      if (answers[idx] === ca) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;
    const result = { score, total: questions.length, percentage, passed };
    if (typeof window !== "undefined") {
      localStorage.setItem(`quiz-${quiz.id}-result`, JSON.stringify(result));
      localStorage.removeItem(storageKey);
    }
    router.replace(`/quiz/${quiz.id}/results`);
  }, [answers, questions, quiz.id, router, storageKey]);

  // -------------------- Timer --------------------
  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, handleSubmit]);

  // -------------------- Camera --------------------
  // Camera setup
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((media) => {
        streamRef.current = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }
      })
      .catch((err) => console.error("Camera error:", err));
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Tab‑switch detection for academic integrity
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((c) => c + 1);
        setShowWarning(true);
      }
    };
    const handleBlur = () => {
      setTabSwitchCount((c) => c + 1);
      setShowWarning(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Auto‑submit after 3 strikes
  useEffect(() => {
    if (tabSwitchCount >= 3) {
      handleSubmit();
    }
  }, [tabSwitchCount, handleSubmit]);

  // -------------------- Navigation --------------------
  const goPrev = () => setCurrentIdx((i) => Math.max(i - 1, 0));
  const goNext = () => setCurrentIdx((i) => Math.min(i + 1, total - 1));

  const selectOption = (optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };



  // -------------------- Rendering --------------------
  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <section className="relative max-w-3xl mx-auto p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Warning: You navigated away from the quiz window!
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Strike {tabSwitchCount} of 3. Excessive tab switching will auto‑submit your quiz.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Resume Quiz
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h1>
        <div className="flex items-center space-x-2 text-sm font-mono text-gray-700 dark:text-gray-300">
          <span role="img" aria-label="timer">⏱️</span>
          <span>{minutes}:{secs}</span>
        </div>
      </header>

      {/* Question Counter */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Question {currentIdx + 1} of {questions.length}
      </div>

      {/* Actual question text */}
      <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
        {questions[currentIdx]?.questionText ?? ""}
      </div>

      {/* Options – four choices per question */}
      <div className="grid gap-3">
        {questions[currentIdx]?.options.map((opt, idx) => (
          <label
            key={idx}
            className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
              answers[currentIdx] === idx ? "bg-indigo-100 border-indigo-500" : "bg-gray-50 dark:bg-gray-700"
            }`}
          >
            <input
              type="radio"
              name={`q-${currentIdx}`}
              checked={answers[currentIdx] === idx}
              onChange={() => selectOption(idx)}
              className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-800 dark:text-gray-200">{opt}</span>
          </label>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            currentIdx === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          Previous
        </button>
        {currentIdx < questions.length - 1 ? (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
          >
            Submit Quiz
          </button>
        )}
      </div>

      {/* Persistent webcam preview – picture‑in‑picture style */}
      <div className="absolute top-4 right-4 w-32 h-24 bg-gray-200 rounded overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
