export function FormError({ mensaje }: { mensaje: string }) {
  if (!mensaje) return null;
  return (
    <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
      {mensaje}
    </p>
  );
}

export function FormSuccess({ mensaje }: { mensaje: string }) {
  if (!mensaje) return null;
  return (
    <p className="rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f5d77b]">
      {mensaje}
    </p>
  );
}
