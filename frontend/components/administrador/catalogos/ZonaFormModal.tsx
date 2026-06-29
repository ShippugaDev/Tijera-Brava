"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import type { ZonaPayload } from "@/lib/admin-catalogos-api";
import type { ZonaCoberturaAdmin } from "@/lib/types";

type Props = {
  abierto: boolean;
  zona?: ZonaCoberturaAdmin | null;
  cargando?: boolean;
  error?: string;
  onCerrar: () => void;
  onGuardar: (data: ZonaPayload) => void;
};

export function ZonaFormModal({ abierto, zona, cargando = false, error = "", onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [distrito, setDistrito] = useState("");
  const [provincia, setProvincia] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    if (!abierto) return;
    setNombre(zona?.nombre ?? "");
    setDistrito(zona?.distrito ?? "");
    setProvincia(zona?.provincia ?? "");
    setDepartamento(zona?.departamento ?? "");
    setErrorLocal("");
  }, [abierto, zona]);

  if (!abierto) return null;

  const guardar = () => {
    if (!nombre.trim()) return setErrorLocal("El nombre es obligatorio.");
    if (!distrito.trim()) return setErrorLocal("El distrito es obligatorio.");

    onGuardar({
      nombre: nombre.trim(),
      distrito: distrito.trim(),
      provincia: provincia.trim() || undefined,
      departamento: departamento.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Catálogo
        </p>
        <h2 className="mt-3 text-2xl font-black">{zona ? "Editar zona" : "Nueva zona"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" onChange={(event) => setNombre(event.target.value)} value={nombre} />
          <Input label="Distrito" onChange={(event) => setDistrito(event.target.value)} value={distrito} />
          <Input label="Provincia" onChange={(event) => setProvincia(event.target.value)} value={provincia} />
          <Input
            label="Departamento"
            onChange={(event) => setDepartamento(event.target.value)}
            value={departamento}
          />
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
