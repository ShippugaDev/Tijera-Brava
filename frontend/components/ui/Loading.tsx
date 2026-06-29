export function Loading({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-neutral-300">
      <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-5 py-4">
        {texto}
      </div>
    </div>
  );
}
