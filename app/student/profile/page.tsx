import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <section className="mx-auto max-w-3xl space-y-4 p-6">
      <Link href="/student/dashboard" className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-semibold text-slate-950">Profile</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="font-medium text-slate-700">Name</dt>
            <dd className="text-slate-950">{session?.user.name ?? "Student"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Email</dt>
            <dd className="text-slate-950">{session?.user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Role</dt>
            <dd className="text-slate-950">{session?.user.role}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
