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

interface EditableQuestion {
  id?: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

const blankQuestion = (): EditableQuestion => ({
  question_text: "",
  options: ["", "", "", ""],
  correct_option_index: 0,
});

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
  const [editQuestions, setEditQuestions] = useState<EditableQuestion[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

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

  const handleOpenEdit = async (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditTitle(quiz.title);
    setEditCategory(quiz.category);
    setEditDuration(quiz.duration_minutes);
    setEditQuestions([]);
    setDeletedQuestionIds([]);
    setEditError("");
    setLoadingQuestions(true);

    const { data, error } = await supabase
      .from("questions")
      .select("id,question_text,options,correct_option_index")
      .eq("quiz_id", quiz.id)
      .order("created_at", { ascending: true });

    if (error) {
      setEditError(`Could not load questions: ${error.message}`);
    } else {
      setEditQuestions((data ?? []).map((question) => ({
        id: question.id,
        question_text: question.question_text,
        options: Array.isArray(question.options) ? question.options : [],
        correct_option_index: question.correct_option_index,
      })));
    }

    setLoadingQuestions(false);
  };

  const handleSaveEdit = async () => {
    if (!editingQuiz) return;
    setEditError("");

    const duration = Number(editDuration);
    if (!editTitle.trim() || !editCategory.trim() || !Number.isInteger(duration) || duration < 1) {
      setEditError("Enter a title, category, and positive whole-number duration.");
      return;
    }

    if (!editQuestions.length || editQuestions.some((question) =>
      !question.question_text.trim() ||
      question.options.length !== 4 ||
      question.options.some((option) => !option.trim()) ||
      !Number.isInteger(question.correct_option_index) ||
      question.correct_option_index < 0 ||
      question.correct_option_index > 3,
    )) {
      setEditError("Each question needs text, four options, and one correct answer.");
      return;
    }

    setSavingEdit(true);
    try {
      const { error: quizError } = await supabase
        .from("quizzes")
        .update({ title: editTitle.trim(), category: editCategory.trim(), duration_minutes: duration })
        .eq("id", editingQuiz.id);
      if (quizError) throw quizError;

      if (deletedQuestionIds.length) {
        const { error } = await supabase.from("questions").delete().in("id", deletedQuestionIds);
        if (error) throw error;
      }

      const existingQuestions = editQuestions.filter((question) => question.id);
      for (const question of existingQuestions) {
        const { error } = await supabase
          .from("questions")
          .update({
            question_text: question.question_text.trim(),
            options: question.options.map((option) => option.trim()),
            correct_option_index: question.correct_option_index,
          })
          .eq("id", question.id!);
        if (error) throw error;
      }

      const newQuestions = editQuestions.filter((question) => !question.id);
      if (newQuestions.length) {
        const { error } = await supabase.from("questions").insert(newQuestions.map((question) => ({
          quiz_id: editingQuiz.id,
          question_text: question.question_text.trim(),
          options: question.options.map((option) => option.trim()),
          correct_option_index: question.correct_option_index,
        })));
        if (error) throw error;
      }

      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Could not save quiz changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const editQuestion = (index: number, changes: Partial<EditableQuestion>) => {
    setEditQuestions((questions) => questions.map((question, questionIndex) =>
      questionIndex === index ? { ...question, ...changes } : question,
    ));
  };

  const editOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = editQuestions[questionIndex];
    if (!question) return;
    editQuestion(questionIndex, {
      options: question.options.map((option, index) => index === optionIndex ? value : option),
    });
  };

  const removeQuestion = (index: number) => {
    if (editQuestions.length <= 1) return;
    const question = editQuestions[index];
    if (question?.id) setDeletedQuestionIds((ids) => [...ids, question.id!]);
    setEditQuestions((questions) => questions.filter((_, questionIndex) => questionIndex !== index));
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
              onClick={() => router.push("/teacher/results")}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              View Results
            </button>
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
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Edit Quiz</h3>
            
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

            {editError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-800 bg-red-950/60 p-3 text-xs text-red-200">
                {editError}
              </p>
            )}

            <div className="mt-6 space-y-4 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">Questions</h4>
                  <p className="mt-1 text-xs text-slate-400">Edit each saved question and answer directly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditQuestions((questions) => [...questions, blankQuestion()])}
                  className="rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  Add Question
                </button>
              </div>

              {loadingQuestions ? (
                <p className="text-sm text-slate-400">Loading saved questions...</p>
              ) : editQuestions.map((question, questionIndex) => (
                <article key={question.id ?? `new-${questionIndex}`} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h5 className="text-sm font-semibold text-white">Question {questionIndex + 1}</h5>
                    <button
                      type="button"
                      disabled={editQuestions.length <= 1}
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-xs font-semibold text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>

                  <textarea
                    value={question.question_text}
                    onChange={(event) => editQuestion(questionIndex, { question_text: event.target.value })}
                    placeholder="Enter your question"
                    className="min-h-24 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-3 rounded-lg border border-slate-800 p-3">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correct_option_index === optionIndex}
                          onChange={() => editQuestion(questionIndex, { correct_option_index: optionIndex })}
                          aria-label={`Mark option ${optionIndex + 1} as correct`}
                        />
                        <input
                          value={option}
                          onChange={(event) => editOption(questionIndex, optionIndex, event.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="w-full border-0 bg-transparent text-sm text-white outline-none"
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
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
                disabled={savingEdit || loadingQuestions}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
