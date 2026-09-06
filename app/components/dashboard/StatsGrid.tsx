"use client";

import StatsCard from "./StatsCard";

const stats = [
  { title: "Available Quizzes", value: 6 },
  { title: "Completed", value: 12 },
  { title: "Average Score", value: "84%" },
];

export default function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <StatsCard key={s.title} title={s.title} value={s.value} />
      ))}
    </div>
  );
}
