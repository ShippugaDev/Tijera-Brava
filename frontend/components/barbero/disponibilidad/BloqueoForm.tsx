"use client";

import { FormEvent, useState } from "react";

type BloqueoFormProps = {
  cargando?: boolean;
  onSubmit: (payload: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
  }) => void;
};

export function BloqueoForm({ cargando = false, onSubmit }: BloqueoFormProps) {
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("13:00");
  const [horaFin, setHoraFin] = useState("15:00");
  const [motivo, setMotivo] = useState("Descanso personal");

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ fecha, horaInicio, horaFin, motivo: motivo.trim() });
  };

  return (
    <form className="grid gap-4" onSubmit={enviar}>
      <label className="block text-sm font-medium text-neutral-200">
        Fecha
        <input
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-neutral-200">
          Hora inicio
          <input
            className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
            type="time"
            value={horaInicio}
            onChange={(event) => setHoraInicio(event.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          Hora fin
          <input
            className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
            type="time"
            value={horaFin}
            onChange={(event) => setHoraFin(event.target.value)}
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-neutral-200">
        Motivo
        <input
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
        />
      </label>
      <button
        className="rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Creando..." : "Crear bloqueo"}
      </button>
    </form>
  );
}
