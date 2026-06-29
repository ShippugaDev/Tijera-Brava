import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-neutral-800 bg-neutral-950/75 p-5 shadow-xl shadow-black/20 ${className}`}
      {...props}
    />
  );
}
