-- Supabase (PostgreSQL) schema for KIET Quiz Portal
-- Passwords are stored only as bcrypt hashes in users.password_hash.

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text,
  role text NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
  roll_number text,
  department text,
  semester text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration integer NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  start_at timestamp with time zone,
  due_at timestamp with time zone,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  UNIQUE (quiz_id, student_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE SET NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL,
  strikes integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone NOT NULL,
  finished_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_window ON quizzes(start_at, due_at);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz_id ON quiz_assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_student_id ON quiz_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON submissions(quiz_id);

-- Migration for existing lowercase role databases:
-- UPDATE users SET role = upper(role) WHERE role IN ('student', 'teacher');
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number text;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS department text;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS semester text;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
-- ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;
-- ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS start_at timestamp with time zone;
-- ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS due_at timestamp with time zone;
-- ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Demo accounts for development.
-- Both use password: 123456
-- To change a demo password, generate a new bcrypt hash and replace password_hash:
-- node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('new-password', 12).then(console.log)"
INSERT INTO users (email, password_hash, name, role, roll_number, department, semester)
VALUES
  (
    'student@gmail.com',
    '$2b$12$ui2jH3J25nLsIX8X.7mCAuRD/pSbPreo6MaTCqsNAhJithhYEV.k2',
    'Demo Student',
    'STUDENT',
    'DEMO-001',
    'Computer Science',
    '5th Semester'
  ),
  (
    'teacher@kiet.edu.pk',
    '$2b$12$ui2jH3J25nLsIX8X.7mCAuRD/pSbPreo6MaTCqsNAhJithhYEV.k2',
    'Demo Teacher',
    'TEACHER',
    NULL,
    'Computer Science',
    NULL
  )
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  roll_number = EXCLUDED.roll_number,
  department = EXCLUDED.department,
  semester = EXCLUDED.semester,
  updated_at = now();
