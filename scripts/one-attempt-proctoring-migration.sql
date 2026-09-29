-- Run once in the existing Supabase project's SQL editor before deploying the
-- corresponding application changes. This preserves existing submissions.

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS attempt_status text NOT NULL DEFAULT 'SUBMITTED'
    CHECK (attempt_status IN ('IN_PROGRESS', 'SUBMITTED', 'TERMINATED')),
  ADD COLUMN IF NOT EXISTS termination_reason text,
  ADD COLUMN IF NOT EXISTS started_at timestamp with time zone;

-- Existing records were created only when a quiz was submitted, so retain
-- their completed status. New records are created at the moment an attempt starts.
UPDATE public.submissions
SET started_at = COALESCE(started_at, submitted_at, now())
WHERE started_at IS NULL;

-- This is the authoritative one-attempt guard. It intentionally fails if the
-- production database already contains duplicate attempts, so no student data
-- is silently deleted or merged.
CREATE UNIQUE INDEX IF NOT EXISTS submissions_one_attempt_per_student_quiz
  ON public.submissions (user_id, quiz_id)
  WHERE user_id IS NOT NULL AND quiz_id IS NOT NULL;
