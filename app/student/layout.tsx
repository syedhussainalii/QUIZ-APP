import type { ReactNode } from "react";
import { requireRole } from "@/lib/authorization";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole("STUDENT");

  return (
    <section className="min-h-screen bg-slate-950 text-slate-100">
      {children}
    </section>
  );
}