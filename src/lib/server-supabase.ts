import { createClient } from "@supabase/supabase-js";

// This uses the existing project configuration. Route handlers authenticate the
// NextAuth session before using it; no new credentials or Supabase project are used.
export const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);
