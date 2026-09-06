import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/types/next-auth";

export async function requireRole(role: UserRole) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(role === "TEACHER" ? "/login/teacher" : "/login/student");
  }

  if (session.user.role !== role) {
    redirect(session.user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard");
  }

  return session;
}

export async function redirectAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  if (session?.user.role === "STUDENT") {
    redirect("/student/dashboard");
  }
}
