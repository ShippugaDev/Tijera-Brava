"use client";

import { useState } from "react";
import Link from "next/link";
import { resolverUrlArchivo } from "@/lib/api";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { BarberoPublico } from "@/lib/types";

const obtenerFotoPerfilBarbero = (barbero: BarberoPublico) =>
  barbero.fotoPerfilUrl ??
  barbero.fotografiaUrl ??
  barbero.imagenPerfilUrl ??
  barbero.urlFoto ??
  barbero.avatarUrl ??
  barbero.usuario?.fotoPerfilUrl ??
  barbero.usuario?.fotografiaUrl ??
  barbero.usuario?.imagenPerfilUrl ??
  barbero.usuario?.urlFoto ??
  barbero.usuario?.avatarUrl ??
  null;

const obtenerIniciales = (barbero: BarberoPublico) =>
  (barbero.nombreProfesional || "Barbero")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("") || "TB";

function FotoBarbero({ barbero }: { barbero: BarberoPublico }) {
  const [fallo, setFallo] = useState(false);
  const fotoUrl = resolverUrlArchivo(obtenerFotoPerfilBarbero(barbero));

  if (!fotoUrl || fallo) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-yellow-300/60 bg-yellow-400/10 text-xl font-black text-yellow-200 shadow-[0_0_24px_rgba(250,204,21,0.16)]">
        {obtenerIniciales(barbero)}
      </div>
    );
  }

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-yellow-300/40 bg-black shadow-[0_0_24px_rgba(250,204,21,0.12)]">
      <img
        alt={`Foto de ${barbero.nombreProfesional}`}
        className="h-full w-full object-cover"
        onError={() => setFallo(true)}
        src={fotoUrl}
      />
    </div>
  );
}

export function BarberoCard({ barbero }: { barbero: BarberoPublico }) {
  const experiencia = barbero.anosExperiencia ?? barbero.aniosExperiencia ?? 0;
  const biografia = barbero.biografia ?? "Profesional de barbería a domicilio.";

  return (
    <article className="flex min-h-[380px] flex-col rounded-2xl border border-yellow-400/20 bg-zinc-950/80 p-6 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-yellow-300/55 hover:shadow-[0_0_32px_rgba(250,204,21,0.12)]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <FotoBarbero barbero={barbero} />
          <span className={getEstadoBadgeClass(barbero.disponible ? "DISPONIBLE" : "PERFIL")}>
            {barbero.disponible ? "DISPONIBLE" : "PERFIL"}
          </span>
        </div>

        <h3 className="mt-5 break-normal text-2xl font-black leading-tight text-white">
          {barbero.nombreProfesional}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-300">
          {biografia}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-[#171717] p-4">
          <p className="text-xs font-semibold text-zinc-400">Experiencia</p>
          <p className="mt-2 font-black text-white">{experiencia} años</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#171717] p-4">
          <p className="text-xs font-semibold text-zinc-400">Calificación</p>
          <p className="mt-2 font-black text-yellow-200">
            {Number(barbero.calificacionPromedio ?? 0).toFixed(1)}
          </p>
        </div>
      </div>

      {barbero.especialidades?.length ? (
        <div className="mt-4 flex min-h-8 flex-wrap gap-2">
          {barbero.especialidades.slice(0, 3).map((especialidad) => (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b5b5b5]" key={especialidad}>
              {especialidad}
            </span>
          ))}
        </div>
      ) : null}

      <Link
        className="mt-auto inline-flex w-full justify-center rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
        href={`/cliente/barberos/${barbero.idBarbero}`}
      >
        Ver perfil
      </Link>
    </article>
  );
}
