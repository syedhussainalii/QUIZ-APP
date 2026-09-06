import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export type RoleType = "STUDENT" | "TEACHER";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        // Accept either role or portal parameter passed from login forms
        const rawRole = (credentials?.role || credentials?.portal || "").toLowerCase();

        console.log("➡️ Login Attempt:", { email, rawRole });

        if (!email || !password) {
          console.log("❌ Failed: Missing email or password");
          throw new Error("Invalid email or password.");
        }

        // Fetch User from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("id,email,name,role,password_hash")
          .eq("email", email)
          .maybeSingle();

        if (error || !data) {
          console.log("❌ Failed: User not found in Supabase for email:", email, error);
          throw new Error("Invalid email or password.");
        }

        if (!data.password_hash) {
          console.log("❌ Failed: User found but password_hash is missing in DB");
          throw new Error("Invalid email or password.");
        }

        console.log("✅ User found in DB:", data.email, "| DB Role:", data.role, "| DB ID:", data.id);

        // Verify Password: try bcrypt first, then fallback to plaintext comparison
        const isBcryptMatch = await bcrypt.compare(password, data.password_hash);
        const isPlaintextMatch = password === data.password_hash;
        const isValid = isBcryptMatch || isPlaintextMatch;

        if (!isValid) {
          console.log("❌ Failed: Password mismatch");
          throw new Error("Invalid email or password.");
        }

        const dbRoleLower = (data.role || "").toLowerCase();

        // Portal Mismatch Check
        if (rawRole === "teacher" && dbRoleLower !== "teacher") {
          console.log("❌ Failed: Student tried to log into Teacher Portal");
          throw new Error("You are not authorized to access the Teacher Portal.");
        }

        if (rawRole === "student" && dbRoleLower !== "student") {
          console.log("❌ Failed: Teacher tried to log into Student Portal");
          throw new Error("You are not authorized to access the Student Portal.");
        }

        const normalizedRole: RoleType = dbRoleLower === "teacher" ? "TEACHER" : "STUDENT";

        console.log("🎉 Authentication Successful!");

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: normalizedRole,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as RoleType;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login/student",
    error: "/login/student",
  },
};
