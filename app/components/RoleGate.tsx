"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RoleGateProps = {
  allowedRoles: ("STUDENT" | "TEACHER")[];
  children: React.ReactNode;
};

export default function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const role = session?.user.role;
    if (!role || !allowedRoles.includes(role)) {
      router.replace(session ? "/student/dashboard" : "/");
    }
  }, [status, session, allowedRoles, router]);

  if (status === "loading" || !session) {
    return null;
  }

  if (!allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
