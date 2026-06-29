"use client";

import { FormEvent, useEffect, useState } from "react";
import type { DiaSemana, HorarioDisponibilidad } from "@/lib/types";

export const diasSemana: DiaSemana[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO"
];

type HorarioFormProps = {
  cargando?: boolean;
  horario?: HorarioDisponibilidad | null;
  submitLabel: string;
  onSubmit: (payload: { diaSemana: DiaSemana; horaInicio: string; horaFin: string }) => void;
};

export function HorarioForm({ cargando = false, horario, submitLabel, onSubmit }: HorarioFormProps) {
  const [diaSemana, setDiaSemana] = useState<DiaSemana>("LUNES");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("18:00");

  useEffect(() => {
    if (!horario) return;
    setDiaSemana(horario.diaSemana);
    setHoraInicio(horario.horaInicio);
    setHoraFin(horario.horaFin);
  }, [horario]);

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ diaSemana, horaInicio, horaFin });
  };

  return (
    <form className="grid gap-4" onSubmit={enviar}>
      <label className="block text-sm font-medium text-neutral-200">
        Día de la semana
        <select
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          value={diaSemana}
          onChange={(event) => setDiaSemana(event.target.value as DiaSemana)}
        >
          {diasSemana.map((dia) => (
            <option key={dia} value={dia}>
              {dia}
            </option>
          ))}
        </select>
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
