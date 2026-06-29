"use client";

import { FormEvent, useState } from "react";
import { RatingInput } from "@/components/cliente/calificaciones/RatingInput";

type CalificacionFormProps = {
  cargando: boolean;
  onSubmit: (payload: { puntuacion: number; comentario?: string }) => void;
};

export function CalificacionForm({ cargando, onSubmit }: CalificacionFormProps) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("Excelente servicio y puntualidad");

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ puntuacion, comentario: comentario.trim() || undefined });
  };

  return (
    <form
      className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20"
      onSubmit={enviar}
    >
      <h2 className="text-xl font-black text-white">Tu opinión del servicio</h2>
      <div className="mt-5 grid gap-5">
        <RatingInput value={puntuacion} onChange={setPuntuacion} />
        <label className="block text-sm font-medium text-neutral-200">
          Comentario
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            maxLength={500}
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
          />
        </label>
        <p className="text-xs text-[#b5b5b5]">{comentario.length}/500 caracteres</p>
      </div>
      <button
        className="mt-5 w-full rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Registrando..." : "Registrar calificación"}
      </button>
    </form>
  );
}
