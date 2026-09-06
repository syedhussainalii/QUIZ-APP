"use client";

type StatsCardProps = {
  title: string;
  value: string | number;
};

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 text-center">
      <dl>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</dd>
      </dl>
    </div>
  );
}
