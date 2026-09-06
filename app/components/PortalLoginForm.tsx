"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Portal = "student" | "teacher";

const genericError = "Invalid email or password.";

export default function PortalLoginForm({
  portal,
  title,
  emailLabel,
  emailPlaceholder,
}: {
  portal: Portal;
  title: string;
  emailLabel: string;
  emailPlaceholder: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(genericError);
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      portal,
    });

    if (!result?.ok) {
      setError(result?.error && result.error !== "CredentialsSignin" ? result.error : genericError);
      setIsSubmitting(false);
      return;
    }

    const session = await getSession();
    if (session?.user.role === "TEACHER") {
      router.replace("/teacher/dashboard");
      return;
    }

    if (session?.user.role === "STUDENT") {
      router.replace("/student/dashboard");
      return;
    }

    setError(genericError);
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use your issued account credentials to continue.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          {emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={emailPlaceholder}
          autoComplete="email"
          required
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
