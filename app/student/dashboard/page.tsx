"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");

interface Quiz {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  due_date: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("id, title, category, difficulty, duration_minutes, due_date")
          .order("created_at", { ascending: false });

        if (!error && data) setQuizzes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            K
          </div>
          <span className="font-bold text-lg text-white tracking-tight">KIET Quiz Portal</span>
        </div>

        <div className="flex items-center space-x-6 text-sm font-medium">
          <span className="text-slate-400">Student Portal</span>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400">
              {session?.user?.name?.[0] || "S"}
            </div>
            <span className="text-slate-200">{session?.user?.name || "Demo Student"}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {session?.user?.name || "Demo Student"} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">Ready to test your knowledge today?</p>
          </div>
        </div>

        {/* Analytics Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Quizzes</span>
            <p className="text-3xl font-extrabold text-white mt-2">{quizzes.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">12</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
            <p className="text-3xl font-extrabold text-indigo-400 mt-2">84%</p>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6">Available Quizzes</h2>
          
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading available quizzes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                        {quiz.category || "General"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        {quiz.difficulty || "Medium"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {quiz.title}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-5">
                      <span>⏱️ {quiz.duration_minutes || 10} Minutes</span>
                      <span>📋 Proctored</span>
                    </div>

                    <button
                      onClick={() => router.push(`/student/quiz/${quiz.id}`)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}