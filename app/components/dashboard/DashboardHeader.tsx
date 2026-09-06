"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function DashboardHeader() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const name = session?.user?.name ?? "";

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        {name ? `Welcome back, ${name} 👋` : "Welcome back 👋"}
        <p className="text-sm text-gray-600 dark:text-gray-400">Ready to test your knowledge?</p>
      </div>
      {session?.user?.image && (
        <Image
          src={session.user.image}
          alt={session.user.name ?? "User"}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
    </header>
  );
}
