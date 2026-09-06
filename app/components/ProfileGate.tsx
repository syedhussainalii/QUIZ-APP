"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProfileGateProps {
  children: React.ReactNode;
}

export default function ProfileGate({ children }: ProfileGateProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // wait for session
    if (!session) {
      // not authenticated, redirect to sign‑in
      router.replace("/login/student");
      return;
    }
    // Check onboarding status stored in localStorage
    const profile = localStorage.getItem("studentProfile");
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [status, session, router]);

  // Render children only when profile exists and session is ready
  if (status !== "authenticated") return null;
  const profile = typeof window !== "undefined" && localStorage.getItem("studentProfile");
  if (!profile) return null;
  return <>{children}</>;
}
