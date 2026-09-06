"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none -z-10" />

      {/* Header / Brand */}
      <header className="px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
            K
          </div>
          <span className="font-bold text-lg text-white tracking-tight">KIET Quiz Portal</span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">System Operational</span>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center my-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span>✨ Proctored Assessment Platform</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Secure University <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Assessment Portal
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 mb-12 leading-relaxed">
          Take and manage secure, timed, and proctored academic assessments. Assess, learn, and track real-time progress.
        </p>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          
          {/* Student Portal Card */}
          <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 p-8 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-2xl hover:shadow-indigo-500/10">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-6 text-indigo-400">
                🎓
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                Student Portal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-8">
                Take your assigned quizzes securely, track availability windows, and review your overall assessment performance.
              </p>
            </div>

            <Link
              href="/login/student"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Login as Student</span>
              <span>→</span>
            </Link>
          </div>

          {/* Teacher Portal Card */}
          <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 p-8 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-2xl hover:shadow-emerald-500/10">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-6 text-emerald-400">
                👨‍🏫
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Teacher Portal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-8">
                Create, schedule, publish, assign, and review university assessments from a centralized faculty workspace.
              </p>
            </div>

            <Link
              href="/login/teacher"
              className="w-full py-3 px-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Login as Teacher</span>
              <span>→</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
        © 2026 KIET Quiz Platform. All rights reserved.
      </footer>
    </div>
  );
}
