"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resolverUrlArchivo } from "@/lib/api";
import { listarBarberos } from "@/lib/cliente-api";
import type { BarberoPublico } from "@/lib/types";

export function BarberosDestacados() {
  const [barberos, setBarberos] = useState<BarberoPublico[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    listarBarberos({ pagina: 1, limite: 4 })
      .then((response) => {
        if (activo) setBarberos(response.datos ?? []);
      })
      .catch(() => {
        if (activo) setBarberos([]);
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
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Cargando barberos">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-[350px] animate-pulse rounded-lg border border-white/10 bg-[#0d0d0d]"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (!barberos.length) {
    return (
      <div className="mt-12 rounded-lg border border-[#d4af37]/20 bg-[#0d0d0d] px-6 py-10 text-center text-[#b5b5b5]">
        Próximamente encontrarás aquí nuestros barberos destacados.
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {barberos.map((barbero) => (
        <BarberoDestacadoCard barbero={barbero} key={barbero.idBarbero} />
      ))}
    </div>
  );
}

function BarberoDestacadoCard({ barbero }: { barbero: BarberoPublico }) {
  const [fotoFallida, setFotoFallida] = useState(false);
  const fotoPerfil = resolverUrlArchivo(
    barbero.fotoPerfilUrl ??
      barbero.usuario?.fotoPerfilUrl ??
      barbero.fotografiaUrl ??
      barbero.imagenPerfilUrl ??
      barbero.urlFoto ??
      barbero.avatarUrl
  );
  const nombre = barbero.nombreProfesional || "Profesional Tijera Brava";
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("") || "TB";
  const especialidad = barbero.especialidades?.length
    ? barbero.especialidades.slice(0, 2).join(" · ")
    : "Barbería profesional";
  const calificacion = Number(barbero.calificacionPromedio ?? 0).toFixed(1);
  const experiencia = Number(barbero.anosExperiencia ?? barbero.aniosExperiencia ?? 0);

  return (
    <article className="flex min-h-[350px] flex-col rounded-lg border border-white/10 bg-[#0d0d0d] p-5 transition hover:-translate-y-1 hover:border-[#d4af37]/45">
      {fotoPerfil && !fotoFallida ? (
        <img
          alt={`Foto de ${nombre}`}
          className="h-40 w-full rounded-lg border border-[#d4af37]/20 object-cover"
          onError={() => setFotoFallida(true)}
          src={fotoPerfil}
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[linear-gradient(145deg,#171717,#050505)] text-4xl font-black text-[#d4af37]">
          {iniciales}
        </div>
      )}
      <h3 className="mt-5 text-xl font-black text-white">{nombre}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-[#b5b5b5]">{especialidad}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-[#f5d77b]">★★★★★ {calificacion}</span>
        <span className="whitespace-nowrap text-[#b5b5b5]">
          {experiencia} {experiencia === 1 ? "año" : "años"}
        </span>
      </div>
      <Link
        className="mt-5 inline-flex w-full justify-center rounded-lg border border-[#d4af37]/50 px-4 py-2.5 text-sm font-bold text-[#f5d77b] transition hover:bg-[#d4af37]/10"
        href="/login"
      >
        Ver perfil
      </Link>
    </article>
  );
}
