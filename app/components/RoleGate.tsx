"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

type UserRole = "STUDENT" | "TEACHER";

interface RoleGateProps {
  children: ReactNode;
  allowedRole: UserRole;
  fallback?: ReactNode;
}

export default function RoleGate({
  children,
  allowedRole,
  fallback = null,
}: RoleGateProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-4 text-xs text-slate-400">Loading permissions...</div>
    );
  }

  // Explicit type cast to avoid string / undefined TS2345 mismatch
  const userRole = (session?.user as { role?: UserRole })?.role;

  if (!userRole || userRole !== allowedRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
