"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState("");

  const prefillDone = React.useRef(false);
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      // Not logged in – send to sign‑in
      router.replace("/login/student");
      return;
    }
    if (!prefillDone.current) {
      // Pre‑fill known info from session
      setFullName(session.user?.name ?? "");
      setEmail(session.user?.email ?? "");
      prefillDone.current = true;
    }
  }, [status, session, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !rollNumber || !department || !semester) {
      setError("Please fill in all required fields.");
      return;
    }
    const profile = { fullName, email, rollNumber, department, semester };
    // Store mock profile in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("studentProfile", JSON.stringify(profile));
    }
    // Redirect to dashboard after onboarding
    router.replace("/student/dashboard");
  };

  if (status === "loading") {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
    <section className="max-w-xl mx-auto p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
        Student Onboarding
      </h1>
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="fullName"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            required
          />
        </div>
        {/* Email (read‑only) */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          />
        </div>
        {/* Roll Number */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="rollNumber"
          >
            Roll Number / Student ID
          </label>
          <input
            id="rollNumber"
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            required
          />
        </div>
        {/* Department */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="department"
          >
            Department
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select department</option>
            <option>Computer Science</option>
            <option>Software Engineering</option>
            <option>Information Technology</option>
            <option>Electrical Engineering</option>
            <option>Mechanical Engineering</option>
          </select>
        </div>
        {/* Semester / Year */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="semester"
          >
            Semester / Year
          </label>
          <input
            id="semester"
            type="text"
            placeholder="e.g., 5th Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </section>
  );
}
