import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  const baseClass =
    "inline-flex rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200";
  const finalClassName = className.includes("inline-flex") ? className : `${baseClass} ${className}`;

  return (
    <span
      className={finalClassName}
      {...props}
    />
  );
}
