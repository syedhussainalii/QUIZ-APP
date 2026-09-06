import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  if (session?.user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  redirect("/login/student");
}
