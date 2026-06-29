"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ServicioBarberoAsignado, ServicioCatalogo } from "@/lib/types";

type ServicioAsignacionFormProps = {
  cargando?: boolean;
  servicioCatalogo?: ServicioCatalogo | null;
  servicioAsignado?: ServicioBarberoAsignado | null;
  submitLabel: string;
  onSubmit: (payload: { precioPersonalizado: number; duracionPersonalizada: number }) => void;
};

export function ServicioAsignacionForm({
  cargando = false,
  servicioCatalogo,
  servicioAsignado,
  submitLabel,
  onSubmit
}: ServicioAsignacionFormProps) {
  const [precioPersonalizado, setPrecioPersonalizado] = useState("");
  const [duracionPersonalizada, setDuracionPersonalizada] = useState("");

  useEffect(() => {
    const precio =
      servicioAsignado?.precioFinal ??
      servicioAsignado?.precioPersonalizado ??
      servicioCatalogo?.precioBase ??
      "";
    const duracion =
      servicioAsignado?.duracionFinal ??
      servicioAsignado?.duracionPersonalizada ??
      servicioCatalogo?.duracionMinutos ??
      servicioCatalogo?.duracionBase ??
      "";
    setPrecioPersonalizado(String(precio));
    setDuracionPersonalizada(String(duracion));
  }, [servicioAsignado, servicioCatalogo]);

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      precioPersonalizado: Number(precioPersonalizado),
      duracionPersonalizada: Number(duracionPersonalizada)
    });
  };

  return (
    <form className="grid gap-4" onSubmit={enviar}>
      <label className="block text-sm font-medium text-neutral-200">
        Precio personalizado
        <input
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          min="1"
          step="0.01"
          type="number"
          value={precioPersonalizado}
          onChange={(event) => setPrecioPersonalizado(event.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-neutral-200">
        Duración personalizada (min)
        <input
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          min="1"
          step="1"
          type="number"
          value={duracionPersonalizada}
          onChange={(event) => setDuracionPersonalizada(event.target.value)}
        />
      </label>
      <button
        className="rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
