"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import type { ServicioPayload } from "@/lib/admin-catalogos-api";
import type { ServicioAdmin } from "@/lib/types";

type Props = {
  abierto: boolean;
  servicio?: ServicioAdmin | null;
  cargando?: boolean;
  error?: string;
  onCerrar: () => void;
  onGuardar: (data: ServicioPayload) => void;
};

export function ServicioFormModal({ abierto, servicio, cargando = false, error = "", onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [duracionMinutos, setDuracionMinutos] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    if (!abierto) return;
    setNombre(servicio?.nombre ?? "");
    setDescripcion(servicio?.descripcion ?? "");
    setPrecioBase(servicio?.precioBase != null ? String(servicio.precioBase) : "");
    setDuracionMinutos(
      servicio?.duracionMinutos != null ? String(servicio.duracionMinutos) : ""
    );
    setErrorLocal("");
  }, [abierto, servicio]);

  if (!abierto) return null;

  const guardar = () => {
    const precio = Number(precioBase);
    const duracion = Number(duracionMinutos);

    if (!nombre.trim()) return setErrorLocal("El nombre es obligatorio.");
    if (!descripcion.trim()) return setErrorLocal("La descripción es obligatoria.");
    if (!Number.isFinite(precio) || precio <= 0) return setErrorLocal("El precio debe ser mayor que 0.");
    if (!Number.isInteger(duracion) || duracion <= 0) return setErrorLocal("La duración debe ser mayor que 0.");

    onGuardar({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precioBase: precio,
      duracionMinutos: duracion
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Catálogo
        </p>
        <h2 className="mt-3 text-2xl font-black">{servicio ? "Editar servicio" : "Nuevo servicio"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" onChange={(event) => setNombre(event.target.value)} value={nombre} />
          <Input
            label="Precio base"
            min="0"
            onChange={(event) => setPrecioBase(event.target.value)}
            type="number"
            value={precioBase}
          />
          <Input
            label="Duración en minutos"
            min="1"
            onChange={(event) => setDuracionMinutos(event.target.value)}
            type="number"
            value={duracionMinutos}
          />
          <label className="block text-sm font-medium text-neutral-200 sm:col-span-2">
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
