"use client";

import { PortafolioForm } from "@/components/barbero/portafolio/PortafolioForm";
import type { PortafolioPayload } from "@/lib/barbero-portafolio-api";
import type { CategoriaCorte, PortafolioCorte } from "@/lib/types";

type EditarPortafolioModalProps = {
  abierto: boolean;
  categorias: CategoriaCorte[];
  publicacion: PortafolioCorte | null;
  cargando?: boolean;
  onCancel: () => void;
  onSubmit: (payload: PortafolioPayload) => void;
};

export function EditarPortafolioModal({
  abierto,
  categorias,
  publicacion,
  cargando = false,
  onCancel,
  onSubmit
}: EditarPortafolioModalProps) {
  if (!abierto || !publicacion) return null;

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm" role="dialog">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Portafolio
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Editar publicación</h2>
        <div className="mt-5">
          <PortafolioForm
            categorias={categorias}
            cargando={cargando}
            publicacion={publicacion}
            submitLabel="Guardar cambios"
            onSubmit={onSubmit}
          />
        </div>
        <button
          className="mt-4 w-full rounded-lg border border-white/10 px-5 py-3 text-sm font-black text-[#b5b5b5] transition hover:border-[#d4af37]/40 hover:text-white"
          disabled={cargando}
          onClick={onCancel}
          type="button"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
