"use client";

import { useEffect, useState } from "react";
import { listarBarberos, listarCalificacionesBarbero } from "@/lib/cliente-api";
import type { CalificacionCliente } from "@/lib/types";

export function TestimoniosReales() {
  const [calificaciones, setCalificaciones] = useState<CalificacionCliente[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    listarBarberos({ pagina: 1, limite: 6 })
      .then(async (response) => {
        const resultados = await Promise.allSettled(
          (response.datos ?? []).map((barbero) =>
            listarCalificacionesBarbero(barbero.idBarbero)
          )
        );
        const opiniones = resultados.flatMap((resultado) =>
          resultado.status === "fulfilled"
            ? resultado.value.datos.calificaciones ?? []
            : []
        );

        if (activo) {
          setCalificaciones(
            opiniones
              .filter(
                (calificacion) =>
                  calificacion.estadoVisibilidad === "VISIBLE" &&
                  Boolean(calificacion.comentario?.trim())
              )
              .sort(
                (a, b) =>
                  new Date(b.fechaCreacion ?? 0).getTime() -
                  new Date(a.fechaCreacion ?? 0).getTime()
              )
              .slice(0, 3)
          );
        }
      })
      .catch(() => {
        if (activo) setCalificaciones([]);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="mt-12 grid gap-5 md:grid-cols-3" aria-label="Cargando testimonios">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-56 animate-pulse rounded-lg border border-white/10 bg-[#171717]"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (!calificaciones.length) {
    return (
      <p className="mt-12 rounded-lg border border-[#d4af37]/20 bg-[#171717] px-6 py-10 text-center text-[#b5b5b5]">
        Pronto verás opiniones reales de nuestros clientes.
      </p>
    );
  }

  return (
    <div className="mt-12 grid gap-5 md:grid-cols-3">
      {calificaciones.map((calificacion) => (
        <TestimonioCard calificacion={calificacion} key={calificacion.idCalificacion} />
      ))}
    </div>
  );
}

function TestimonioCard({ calificacion }: { calificacion: CalificacionCliente }) {
  const puntuacion = Math.max(1, Math.min(5, Number(calificacion.puntuacion) || 1));
  const cliente = [calificacion.cliente?.nombres, calificacion.cliente?.apellidos]
    .filter(Boolean)
    .join(" ") || "Cliente de Tijera Brava";
  const barbero = [calificacion.barbero?.nombres, calificacion.barbero?.apellidos]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="flex min-h-56 flex-col rounded-lg border border-white/10 bg-[#171717] p-6 transition hover:border-[#d4af37]/40">
      <p aria-label={`${puntuacion} de 5 estrellas`} className="flex gap-1 text-lg">
        {Array.from({ length: 5 }, (_, index) => (
          <span className={index < puntuacion ? "text-[#f5d77b]" : "text-white/15"} key={index}>
            ★
          </span>
        ))}
      </p>
      <p className="mt-5 flex-1 text-lg font-semibold leading-8 text-white">
        “{calificacion.comentario}”
      </p>
      <p className="mt-5 text-sm font-bold text-[#f5d77b]">{cliente}</p>
      {barbero ? (
        <p className="mt-1 text-xs text-[#b5b5b5]">Servicio con {barbero}</p>
      ) : null}
    </article>
  );
}
