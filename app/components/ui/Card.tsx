import React from "react";


export default function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface shadow-card rounded-md p-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-4 text-foreground">{title}</h2>}
      {children}
    </div>
  );
}
