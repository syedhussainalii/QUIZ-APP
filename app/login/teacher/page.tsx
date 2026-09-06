"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role: "TEACHER",
      });

      if (res?.error) {
        setErrorMsg("Invalid credentials or unauthorized faculty role.");
        setLoading(false);
        return;
      }

      router.push("/teacher/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMsg("An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-emerald-500 selection:text-white overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-600/20 via-teal-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <header className="px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-900/60">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/25">
            K
          </div>
          <span className="font-bold text-lg text-white tracking-tight">KIET Quiz Portal</span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition">
          ← Back to portal selection
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 w-full my-auto">
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Teacher Portal
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-4 leading-tight">
                Secure University Assessment Portal
              </h2>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                KIET email is required for this portal, and the database role must be TEACHER.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <Link
                href="/login/student"
                className="w-full py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center justify-between"
              >
                <span>Student Login</span>
                <span className="text-emerald-400">→</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 p-8 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Teacher Login</h3>
              <p className="text-xs text-slate-400 mt-1">Use your issued account credentials to continue.</p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">KIET Email</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@kiet.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
        © 2026 KIET Quiz Platform. All rights reserved.
      </footer>
    </div>
  );
}