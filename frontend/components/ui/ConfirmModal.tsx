"use client";

type ConfirmModalProps = {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  cargando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  confirmLabel,
  cancelLabel = "Volver",
  loadingLabel = "Cancelando...",
  cargando = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!abierto) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Confirmación
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">{titulo}</h2>
        <p className="mt-4 leading-7 text-[#b5b5b5]">{mensaje}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-white/10 px-5 py-3 text-sm font-black text-[#b5b5b5] transition hover:border-[#d4af37]/40 hover:text-white"
            disabled={cargando}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={cargando}
            onClick={onConfirm}
            type="button"
          >
            {cargando ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
