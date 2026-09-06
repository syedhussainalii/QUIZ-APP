import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

// Optional TypeScript types for tables
export type User = {
  id: string;
  email: string;
  name: string | null;
  password_hash?: string;
  role: "STUDENT" | "TEACHER";
  roll_number?: string | null;
  department?: string | null;
  semester?: string | null;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  duration: number; // minutes
  created_by: string;
  is_published?: boolean;
  start_at?: string | null;
  due_at?: string | null;
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[]; // stored as JSON
  correct_index: number;
};

export type Submission = {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: Record<string, number>;
  score: number;
  started_at: string;
  finished_at: string;
  strikes: number;
};
