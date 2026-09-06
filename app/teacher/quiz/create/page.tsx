"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

type Question = {
  question_text: string;
  options: string[];
  correct_option_index: number;
};

type QuizForm = {
  title: string;
  category: string;
  duration_minutes: string;
  due_date: string;
  difficulty: string;
  questions: Question[];
};

type ImportedQuiz = {
  title?: unknown;
  category?: unknown;
  duration_minutes?: unknown;
  due_date?: unknown;
  difficulty?: unknown;
  questions?: unknown;
};

const blankQuestion = (): Question => ({
  question_text: "",
  options: ["", "", "", ""],
  correct_option_index: 0,
});

const initialForm = (): QuizForm => ({
  title: "",
  category: "",
  duration_minutes: "30",
  due_date: "",
  difficulty: "Medium",
  questions: [blankQuestion()],
});

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function CreateQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<QuizForm>(initialForm);
  const [showImport, setShowImport] = useState(false);
  const [inputDuration, setInputDuration] = useState("30");
  const [submitting, setSubmitting] = useState(false);

  const [notice, setNotice] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("teacher-quiz-import");

    if (!stored) return;

    sessionStorage.removeItem("teacher-quiz-import");

    try {
      loadJson(JSON.parse(stored));

      setNotice({
        type: "success",
        text: "Quiz file loaded. Review it, then create the quiz.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not import the quiz file.",
      });
    }
  }, []);

  function loadJson(value: unknown, durationOverride?: number) {
    if (!value || typeof value !== "object") {
      throw new Error("The JSON must contain a quiz object.");
    }

    const imported = value as ImportedQuiz;

    if (
      typeof imported.title !== "string" ||
      typeof imported.category !== "string" ||
      typeof imported.due_date !== "string" ||
      !Array.isArray(imported.questions) ||
      !imported.questions.length
    ) {
      throw new Error(
        "The JSON needs title, category, due_date, and questions.",
      );
    }

    const durationMinutes =
      durationOverride ??
      (imported.duration_minutes === undefined
        ? 30
        : imported.duration_minutes);

    if (
      typeof durationMinutes !== "number" ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1
    ) {
      throw new Error(
        "duration_minutes must be a positive whole number.",
      );
    }

    const due = new Date(imported.due_date);

    if (Number.isNaN(due.getTime())) {
      throw new Error("The JSON due_date is invalid.");
    }

    const questions = imported.questions.map((question) => {
      if (!question || typeof question !== "object") {
        throw new Error(
          "Every question needs text, exactly four options, and a correct_option_index from 0 to 3.",
        );
      }

      const item = question as {
        question_text?: unknown;
        options?: unknown;
        correct_option_index?: unknown;
      };

      if (
        typeof item.question_text !== "string" ||
        !Array.isArray(item.options) ||
        item.options.length !== 4 ||
        !item.options.every(
          (option) => typeof option === "string",
        ) ||
        typeof item.correct_option_index !== "number" ||
        !Number.isInteger(item.correct_option_index) ||
        item.correct_option_index < 0 ||
        item.correct_option_index > 3
      ) {
        throw new Error(
          "Every question needs text, exactly four options, and a correct_option_index from 0 to 3.",
        );
      }

      return {
        question_text: item.question_text,
        options: item.options,
        correct_option_index: item.correct_option_index,
      };
    });

    setForm({
      title: imported.title,
      category: imported.category,
      duration_minutes: String(durationMinutes),
      due_date: localDateTime(due),
      difficulty:
        typeof imported.difficulty === "string"
          ? imported.difficulty
          : "Medium",
      questions,
    });
  }

  async function onImport(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setNotice({
        type: "error",
        text: "Please choose a .json file.",
      });

      return;
    }

    try {
      const parsedJson: unknown = JSON.parse(
        await file.text(),
      );

      const jsonDuration =
        parsedJson &&
        typeof parsedJson === "object" &&
        "duration_minutes" in parsedJson
          ? Number(
              (
                parsedJson as {
                  duration_minutes?: unknown;
                }
              ).duration_minutes,
            )
          : 0;

      const durationMinutes =
        Number(inputDuration) || jsonDuration || 30;

      loadJson(parsedJson, durationMinutes);

      setShowImport(false);

      setNotice({
        type: "success",
        text: "Quiz file loaded. Review it, then create the quiz.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not parse the JSON file.",
      });
    }
  }

  function editQuestion(
    questionIndex: number,
    changes: Partial<Question>,
  ) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map(
        (question, index) =>
          index === questionIndex
            ? { ...question, ...changes }
            : question,
      ),
    }));
  }

  function editOption(
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map(
        (question, index) =>
          index === questionIndex
            ? {
                ...question,
                options: question.options.map(
                  (option, optionNumber) =>
                    optionNumber === optionIndex
                      ? value
                      : option,
                ),
              }
            : question,
      ),
    }));
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setNotice(null);

    // -----------------------------------------
    // 1. CHECK AUTHENTICATION LOADING STATE
    // -----------------------------------------

    if (status === "loading") {
      setNotice({
        type: "error",
        text:
          "Authentication is still loading. Please wait a second and try again.",
      });

      return;
    }

    // -----------------------------------------
    // 2. GET TEACHER ID SAFELY
    // -----------------------------------------

    const teacherId = session?.user?.id;

    if (!session || !teacherId) {
      setNotice({
        type: "error",
        text:
          "Your teacher session is unavailable. Please sign out and sign in again.",
      });

      return;
    }

    // -----------------------------------------
    // 3. VALIDATE QUIZ FORM
    // -----------------------------------------

    const duration = Number(form.duration_minutes);

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.due_date ||
      !Number.isInteger(duration) ||
      duration < 1
    ) {
      setNotice({
        type: "error",
        text:
          "Complete the title, category, duration, and due date.",
      });

      return;
    }

    if (
      form.questions.some(
        (question) =>
          !question.question_text.trim() ||
          question.options.some(
            (option) => !option.trim(),
          ),
      )
    ) {
      setNotice({
        type: "error",
        text:
          "Each question needs text and four options.",
      });

      return;
    }

    setSubmitting(true);

    try {
      // -----------------------------------------
      // 4. BUILD QUIZ PAYLOAD
      // -----------------------------------------

      const quizPayload = {
        teacherId: teacherId,
        title: form.title.trim(),
        category: form.category.trim(),
        difficulty: form.difficulty,
        duration_minutes: duration,
        due_date: new Date(
          form.due_date,
        ).toISOString(),
      };

      console.log(
        "Creating quiz with teacherId:",
        quizPayload.teacherId,
      );

      // -----------------------------------------
      // 5. CREATE QUIZ IN SUPABASE
      // -----------------------------------------

      const {
        data: quiz,
        error: quizError,
      } = await supabase
        .from("quizzes")
        .insert([
          {
            title: quizPayload.title,
            category: quizPayload.category,
            difficulty: quizPayload.difficulty,
            duration_minutes:
              quizPayload.duration_minutes,
            due_date: quizPayload.due_date,

            // Teacher ID is explicitly saved
            created_by: quizPayload.teacherId,
          },
        ])
        .select("id")
        .single();

      if (quizError || !quiz) {
        setNotice({
          type: "error",
          text: `Could not create quiz: ${
            quizError?.message ??
            "No quiz record returned."
          }`,
        });

        setSubmitting(false);

        return;
      }

      // -----------------------------------------
      // 6. CREATE QUESTIONS
      // -----------------------------------------

      const {
        error: questionError,
      } = await supabase
        .from("questions")
        .insert(
          form.questions.map((question) => ({
            quiz_id: quiz.id,

            question_text:
              question.question_text.trim(),

            options: question.options.map(
              (option) => option.trim(),
            ),

            correct_option_index:
              Number(
                question.correct_option_index,
              ) || 0,
          })),
        );

      if (questionError) {
        setNotice({
          type: "error",
          text:
            `Quiz was created, but its questions could not be saved: ${questionError.message}`,
        });

        setSubmitting(false);

        return;
      }

      // -----------------------------------------
      // 7. SUCCESS
      // -----------------------------------------

      setNotice({
        type: "success",
        text:
          "Quiz created successfully. Redirecting…",
      });

      router.push(
        "/teacher/dashboard?created=1",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Quiz creation failed:",
        error,
      );

      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unexpected error while creating quiz.",
      });

      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Create Quiz
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Build a timed multiple-choice assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          Bulk JSON Upload
        </button>
      </div>

      {notice && (
        <p
          role="alert"
          className={`rounded-md p-3 text-sm ${
            notice.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-6"
      >
        <div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <Field label="Title">
            <input
              required
              className={inputClass}
              placeholder="Data Structures"
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value,
                })
              }
            />
          </Field>

          <Field label="Category">
            <input
              required
              className={inputClass}
              placeholder="CS"
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value,
                })
              }
            />
          </Field>

          <Field label="Duration (minutes)">
            <input
              required
              min="1"
              type="number"
              className={inputClass}
              value={form.duration_minutes}
              onChange={(event) =>
                setForm({
                  ...form,
                  duration_minutes:
                    event.target.value,
                })
              }
            />
          </Field>

          <Field label="Difficulty level">
            <select
              className={inputClass}
              value={form.difficulty}
              onChange={(event) =>
                setForm({
                  ...form,
                  difficulty:
                    event.target.value,
                })
              }
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </Field>

          <Field label="Due date & time">
            <input
              required
              type="datetime-local"
              className={inputClass}
              value={form.due_date}
              onChange={(event) =>
                setForm({
                  ...form,
                  due_date:
                    event.target.value,
                })
              }
            />
          </Field>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              Questions
            </h2>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  questions: [
                    ...form.questions,
                    blankQuestion(),
                  ],
                })
              }
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Add Question
            </button>
          </div>

          {form.questions.map(
            (question, questionIndex) => (
              <article
                key={questionIndex}
                className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Question{" "}
                    {questionIndex + 1}
                  </h3>

                  {form.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          questions:
                            form.questions.filter(
                              (_, index) =>
                                index !==
                                questionIndex,
                            ),
                        })
                      }
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  required
                  className={`${inputClass} min-h-24`}
                  placeholder="Enter your question"
                  value={
                    question.question_text
                  }
                  onChange={(event) =>
                    editQuestion(
                      questionIndex,
                      {
                        question_text:
                          event.target.value,
                      },
                    )
                  }
                />

                <div className="grid gap-3 md:grid-cols-2">
                  {question.options.map(
                    (option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-3 rounded-md border border-slate-200 p-3"
                      >
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={
                            question.correct_option_index ===
                            optionIndex
                          }
                          onChange={() =>
                            editQuestion(
                              questionIndex,
                              {
                                correct_option_index:
                                  optionIndex,
                              },
                            )
                          }
                          aria-label={`Mark option ${
                            optionIndex + 1
                          } as correct`}
                        />

                        <input
                          required
                          className="w-full border-0 bg-transparent p-0 text-sm text-slate-950 outline-none"
                          placeholder={`Option ${
                            optionIndex + 1
                          }`}
                          value={option}
                          onChange={(event) =>
                            editOption(
                              questionIndex,
                              optionIndex,
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    ),
                  )}
                </div>
              </article>
            ),
          )}
        </div>

        <button
          type="submit"
          disabled={
            submitting ||
            status === "loading"
          }
          className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Creating quiz…"
            : "Create Quiz"}
        </button>
      </form>

      {showImport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2
                id="import-title"
                className="text-lg font-semibold text-slate-950"
              >
                Import quiz JSON
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowImport(false)
                }
                aria-label="Close import dialog"
                className="text-xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Select a JSON file to populate this
              form for review.
            </p>

            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              Quiz Duration (Minutes)

              <input
                type="number"
                min="1"
                value={inputDuration}
                onChange={(event) =>
                  setInputDuration(
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </label>

            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              onChange={onImport}
              className="mt-5 block w-full text-sm text-slate-700"
            />

            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Choose JSON file
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function localDateTime(date: Date) {
  return new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 16);
}

