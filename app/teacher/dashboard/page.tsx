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
  duration_minutes: number;
  due_date: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDuration, setEditDuration] = useState(10);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, category, duration_minutes, due_date")
        .order("created_at", { ascending: false });

      if (!error && data) setQuizzes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    await supabase.from("quizzes").delete().eq("id", id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const handleOpenEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditTitle(quiz.title);
    setEditCategory(quiz.category);
    setEditDuration(quiz.duration_minutes);
  };

  const handleSaveEdit = async () => {
    if (!editingQuiz) return;
    await supabase
      .from("quizzes")
      .update({ title: editTitle, category: editCategory, duration_minutes: Number(editDuration) })
      .eq("id", editingQuiz.id);

    setEditingQuiz(null);
    fetchQuizzes();
  };

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
          <span className="text-slate-400">Teacher Portal</span>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400">
              {session?.user?.name?.[0] || "F"}
            </div>
            <span className="text-slate-200">{session?.user?.name || "Demo Faculty"}</span>
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
        {/* Header Actions */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Create, schedule, and monitor your academic assessments.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push("/teacher/quiz/create")}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition"
            >
              + Create Manual Quiz
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Quizzes Created</span>
            <p className="text-3xl font-extrabold text-white mt-2">{quizzes.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Assessments</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{quizzes.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <p className="text-3xl font-extrabold text-indigo-400 mt-2">18</p>
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Your Created Quizzes</h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Loading quiz records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{quiz.title}</td>
                      <td className="px-6 py-4">{quiz.category || "General"}</td>
                      <td className="px-6 py-4">{quiz.duration_minutes} mins</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(quiz)}
                          className="px-3 py-1 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className="px-3 py-1 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white text-xs font-semibold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Quiz Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Quiz Details</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingQuiz(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}