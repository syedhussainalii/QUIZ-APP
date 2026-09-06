import type { ReactNode } from "react";
import { requireRole } from "@/lib/authorization";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  await requireRole("TEACHER");

  return (
    <section className="min-h-screen bg-slate-950 text-slate-100">
      {children}
    </section>
  );
}