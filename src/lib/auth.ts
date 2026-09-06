import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

type DbRole = "student" | "teacher";

// Declare module augmentation so TypeScript knows about custom user/session fields
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        const portal = credentials?.portal?.toLowerCase();

        console.log("➡️ Login Attempt:", { email, portal });

        if (!email || !password) {
          console.log("❌ Failed: Missing email or password");
          throw new Error("Invalid email or password.");
        }

        // Fetch User from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("id,email,name,role,password_hash")
          .eq("email", email)
          .single();

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

        console.log("🔑 Password Valid?:", isValid, `(Bcrypt: ${isBcryptMatch}, Plaintext: ${isPlaintextMatch})`);

        if (!isValid) {
          console.log("❌ Failed: Password mismatch");
          throw new Error("Invalid email or password.");
        }

        const dbRole = data.role?.toLowerCase() as DbRole | undefined;

        // Portal Mismatch Check
        if (portal === "teacher" && dbRole !== "teacher") {
          console.log("❌ Failed: Student tried to log into Teacher Portal");
          throw new Error("You are not authorized to access the Teacher Portal.");
        }

        if (portal === "student" && dbRole !== "student") {
          console.log("❌ Failed: Teacher tried to log into Student Portal");
          throw new Error("You are not authorized to access the Student Portal.");
        }

        console.log("🎉 Authentication Successful!");

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: dbRole === "teacher" ? "TEACHER" : "STUDENT",
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
        session.user.role = token.role as string;
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