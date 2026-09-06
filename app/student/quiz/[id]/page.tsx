"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  tabViolations: number;
}

export default function StudentQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id as string;
  const { data: session } = useSession();

  // Quiz & State Management
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Result Modal State
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Timer & Security Tracking
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [tabViolations, setTabViolations] = useState(0);

  // Onboarding & Camera States
  const [showOnboardingModal, setShowOnboardingModal] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Fetch Quiz Details & Questions
  useEffect(() => {
    if (!quizId) return;

    async function fetchQuizData() {
      try {
        setLoading(true);
        setErrorMsg("");

        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("id, title, category, duration_minutes")
          .eq("id", quizId)
          .maybeSingle();

        if (quizError) throw quizError;
        if (!quizData) throw new Error("Quiz not found in database.");

        setQuiz(quizData);
        setTimeLeft((quizData.duration_minutes || 10) * 60);

        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, question_text, options, correct_option_index")
          .eq("quiz_id", quizId);

        if (questionsError) throw questionsError;

        const formattedQuestions = (questionsData || []).map((q) => {
          let parsedOptions: string[] = [];
          if (Array.isArray(q.options)) {
            parsedOptions = q.options;
          } else if (typeof q.options === "string") {
            try {
              parsedOptions = JSON.parse(q.options);
            } catch {
              parsedOptions = [];
            }
          }
          return {
            ...q,
            options: parsedOptions,
          };
        });

        setQuestions(formattedQuestions);
      } catch (err: any) {
        console.error("Fetch Quiz Error:", err);
        setErrorMsg(err.message || "Failed to load assessment details.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizData();
  }, [quizId]);

  // 2. Camera Setup
  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera permissions error:", err);
      setCameraError("Camera permission is required for proctored assessments.");
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 3. Tab Violations Detection
  useEffect(() => {
    if (showOnboardingModal || quizResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const updated = prev + 1;
          if (updated >= 3) {
            alert("Maximum security violations reached (3/3). Submitting assessment automatically.");
            handleSubmitQuiz();
          }
          return updated;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [showOnboardingModal, quizResult]);

  // 4. Countdown Timer Handler
  useEffect(() => {
    if (showOnboardingModal || quizResult || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev !== null ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOnboardingModal, quizResult, timeLeft]);

  const handleStartAssessment = () => {
    setShowOnboardingModal(false);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  // 5. Submit Handler (Calculates Score and Opens Results Modal)
  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      let calculatedScore = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correct_option_index) {
          calculatedScore += 1;
        }
      });

      const totalQ = questions.length || 1;
      const computedPercentage = Math.round((calculatedScore / totalQ) * 100);
      const isPassed = computedPercentage >= 50;

      const submissionPayload = {
        id: crypto.randomUUID(),
        quiz_id: quizId,
        student_name: session?.user?.name || "Demo Student",
        score: calculatedScore,
        total_questions: questions.length,
        percentage: computedPercentage,
        passed: isPassed,
        tab_violations: tabViolations,
        ...(session?.user?.id ? { user_id: session.user.id } : {}),
      };

      const { error: insertError } = await supabase
        .from("submissions")
        .insert([submissionPayload]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Exit fullscreen mode on completion
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Display the result modal instantly
      setQuizResult({
        score: calculatedScore,
        totalQuestions: questions.length,
        percentage: computedPercentage,
        passed: isPassed,
        tabViolations: tabViolations,
      });
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(`Assessment could not be submitted: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-300">Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white p-6 select-none font-sans antialiased">
      
      {/* 🏆 RESULTS MODAL OVERLAY */}
      {quizResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mx-auto">
              {quizResult.passed ? "🎉" : "📊"}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">
                {quizResult.passed ? "Assessment Passed!" : "Assessment Completed"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Here is your final performance breakdown.</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Score</span>
                <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
                  {quizResult.score} / {quizResult.totalQuestions}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Percentage</span>
                <span className={`text-2xl font-extrabold mt-1 block ${quizResult.passed ? "text-emerald-400" : "text-amber-400"}`}>
                  {quizResult.percentage}%
                </span>
              </div>
            </div>

            {/* Meta details */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Proctoring Status:</span>
                <span className="text-emerald-400 font-semibold">Verified</span>
              </div>
              <div className="flex justify-between">
                <span>Tab Violations:</span>
                <span className={quizResult.tabViolations > 0 ? "text-amber-400 font-semibold" : "text-slate-200"}>
                  {quizResult.tabViolations} / 3
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/student/dashboard")}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ONBOARDING SECURITY MODAL */}
      {showOnboardingModal && !quizResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Proctored Assessment Rules</h2>
            <p className="text-sm text-slate-300 mb-4">
              Please enable your camera and accept terms to launch the exam.
            </p>

            <ul className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4">
              <li>• Fullscreen mode will be requested upon launch.</li>
              <li>• Tab switching is monitored (3 violations triggers auto-submission).</li>
              <li>• Live camera monitor must remain active throughout the session.</li>
            </ul>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Webcam Verification</label>
              <div className="relative w-full h-48 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isCameraActive ? "hidden" : ""}`}
                />
                {!isCameraActive && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Enable Camera
                  </button>
                )}
              </div>
              {cameraError && <p className="text-red-400 text-xs mt-2">{cameraError}</p>}
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-300 cursor-pointer">
                I agree to the proctoring rules and academic integrity guidelines.
              </label>
            </div>

            <button
              disabled={!termsAccepted || !isCameraActive}
              onClick={handleStartAssessment}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm rounded-xl transition"
            >
              Start Assessment
            </button>
          </div>
        </div>
      )}

      {/* FLOATING CAMERA WIDGET */}
      {!showOnboardingModal && isCameraActive && !quizResult && (
        <div className="fixed bottom-4 right-4 z-40 w-40 h-28 bg-black rounded-xl overflow-hidden border-2 border-indigo-500 shadow-xl">
          <video
            ref={(node) => {
              if (node && streamRef.current) node.srcObject = streamRef.current;
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            <span>REC</span>
          </div>
        </div>
      )}

      {/* QUIZ CONTAINER */}
      <div className="max-w-4xl mx-auto">
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-indigo-400 font-semibold uppercase">{quiz?.category}</span>
            <h1 className="text-2xl font-bold text-white">{quiz?.title}</h1>
            <p className="text-xs text-slate-400 mt-1">Duration: {quiz?.duration_minutes} Minutes</p>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Time Remaining</span>
            <span className="text-xl font-mono font-bold text-red-400">
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </span>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {tabViolations > 0 && (
          <div className="mb-6 p-4 bg-amber-950/60 border border-amber-800 text-amber-300 rounded-xl text-sm">
            Warning: Tab switching detected! Violations count: {tabViolations}/3
          </div>
        )}

        <main className="space-y-6 mb-8">
          {questions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No questions found for this quiz.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <h3 className="text-base font-semibold text-slate-200 mb-4">
                  {idx + 1}. {q.question_text}
                </h3>

                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[q.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                          isSelected
                            ? "bg-indigo-600 text-white border-2 border-indigo-400"
                            : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </main>

        <footer className="pb-12">
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || showOnboardingModal || questions.length === 0}
            className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 text-white font-bold rounded-xl shadow-xl transition"
          >
            {submitting ? "Submitting Assessment..." : "Submit Assessment"}
          </button>
        </footer>
      </div>
    </div>
  );
}