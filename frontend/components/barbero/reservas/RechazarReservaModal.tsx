"use client";

import { useEffect, useState } from "react";

type RechazarReservaModalProps = {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  confirmLabel: string;
  loadingLabel?: string;
  cargando?: boolean;
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
};

export function RechazarReservaModal({
  abierto,
  titulo,
  mensaje,
  confirmLabel,
  loadingLabel = "Procesando...",
  cargando = false,
  onCancel,
  onConfirm
}: RechazarReservaModalProps) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (abierto) setMotivo("");
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Confirmación
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">{titulo}</h2>
        <p className="mt-4 leading-7 text-[#b5b5b5]">{mensaje}</p>
        <label className="mt-5 block text-sm font-medium text-neutral-200">
          Motivo
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            disabled={cargando}
            placeholder="Describe el motivo"
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-white/10 px-5 py-3 text-sm font-black text-[#b5b5b5] transition hover:border-[#d4af37]/40 hover:text-white"
            disabled={cargando}
            onClick={onCancel}
            type="button"
          >
            Volver
          </button>
          <button
            className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={cargando}
            onClick={() => onConfirm(motivo.trim())}
            type="button"
          >
            {cargando ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
