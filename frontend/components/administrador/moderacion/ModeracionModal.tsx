"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormMessage";

type Props = {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  motivoInicial?: string;
  motivoObligatorio?: boolean;
  cargando?: boolean;
  error?: string;
  onCerrar: () => void;
  onConfirmar: (motivo: string) => void;
};

export function ModeracionModal({
  abierto,
  titulo,
  descripcion,
  motivoInicial = "",
  motivoObligatorio = false,
  cargando = false,
  error = "",
  onCerrar,
  onConfirmar
}: Props) {
  const [motivo, setMotivo] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    if (abierto) {
      setMotivo(motivoInicial);
      setErrorLocal("");
    }
  }, [abierto, motivoInicial]);

  if (!abierto) return null;

  const confirmar = () => {
    if (motivoObligatorio && !motivo.trim()) {
      setErrorLocal("Ingresa un motivo de moderación.");
      return;
    }

    onConfirmar(motivo.trim());
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Moderación
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">{titulo}</h2>
        <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">{descripcion}</p>

        <label className="mt-5 block text-sm font-semibold text-neutral-200">
          Motivo de moderación
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            disabled={cargando}
            onChange={(event) => setMotivo(event.target.value)}
            placeholder="Ej. Contenido inapropiado o revisión aprobada"
            value={motivo}
          />
        </label>
        <div className="mt-4">
          <FormError mensaje={errorLocal || error} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={cargando} onClick={onCerrar} type="button" variant="secondary">
            Volver
          </Button>
          <Button
            className="bg-[#d4af37] text-black hover:bg-[#f5d77b]"
            disabled={cargando}
            onClick={confirmar}
            type="button"
          >
            {cargando ? "Guardando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
