"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import type { CategoriaPayload } from "@/lib/admin-catalogos-api";
import type { CategoriaCorteAdmin } from "@/lib/types";

type Props = {
  abierto: boolean;
  categoria?: CategoriaCorteAdmin | null;
  cargando?: boolean;
  error?: string;
  onCerrar: () => void;
  onGuardar: (data: CategoriaPayload) => void;
};

export function CategoriaFormModal({ abierto, categoria, cargando = false, error = "", onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    if (!abierto) return;
    setNombre(categoria?.nombre ?? "");
    setDescripcion(categoria?.descripcion ?? "");
    setErrorLocal("");
  }, [abierto, categoria]);

  if (!abierto) return null;

  const guardar = () => {
    if (!nombre.trim()) return setErrorLocal("El nombre es obligatorio.");
    onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Catálogo
        </p>
        <h2 className="mt-3 text-2xl font-black">
          {categoria ? "Editar categoría" : "Nueva categoría"}
        </h2>
        <div className="mt-5 space-y-4">
          <Input label="Nombre" onChange={(event) => setNombre(event.target.value)} value={nombre} />
          <label className="block text-sm font-medium text-neutral-200">
            Descripción
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              onChange={(event) => setDescripcion(event.target.value)}
              value={descripcion}
            />
          </label>
        </div>
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
            onClick={guardar}
            type="button"
          >
            {cargando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
