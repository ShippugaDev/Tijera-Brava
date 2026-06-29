"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { resolverUrlArchivo } from "@/lib/api";
import { listarBarberos, listarPortafolioBarbero } from "@/lib/cliente-api";
import type { PortafolioCorte } from "@/lib/types";

const esContenidoLookIA = (titulo: string) =>
  /look\s*ia|simulaci[oó]n|inteligencia artificial/i.test(titulo);

export function GaleriaPortafolio() {
  const [publicaciones, setPublicaciones] = useState<PortafolioCorte[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    listarBarberos({ pagina: 1, limite: 6 })
      .then(async (response) => {
        const resultados = await Promise.allSettled(
          (response.datos ?? []).map((barbero) => listarPortafolioBarbero(barbero.idBarbero))
        );
        const portafolios = resultados.flatMap((resultado) =>
          resultado.status === "fulfilled" ? resultado.value.datos ?? [] : []
        );

        if (activo) {
          setPublicaciones(
            portafolios
              .filter(
                (publicacion) =>
                  Boolean(publicacion.imagenUrl?.trim()) &&
                  publicacion.estadoVisibilidad === "VISIBLE" &&
                  !esContenidoLookIA(publicacion.titulo)
              )
              .sort((a, b) => Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)))
              .slice(0, 6)
          );
        }
      })
      .catch(() => {
        if (activo) setPublicaciones([]);
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
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando galería">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="h-64 animate-pulse rounded-lg border border-[#d4af37]/15 bg-[#090909]" key={index} />
        ))}
      </div>
    );
  }

  if (!publicaciones.length) {
    return (
      <p className="mt-12 rounded-lg border border-[#d4af37]/20 bg-[#090909] px-6 py-10 text-center text-[#b5b5b5]">
        Pronto se mostrarán más trabajos publicados por nuestros barberos.
      </p>
    );
  }

  return (
    <>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {publicaciones.map((publicacion, index) => (
          <GaleriaCard index={index} publicacion={publicacion} key={publicacion.idPortafolioCorte} />
        ))}
      </div>
      {publicaciones.length < 6 ? (
        <p className="mt-6 text-center text-sm text-[#b5b5b5]">
          Pronto se mostrarán más trabajos publicados por nuestros barberos.
        </p>
      ) : null}
    </>
  );
}

function GaleriaCard({
  index,
  publicacion
}: {
  index: number;
  publicacion: PortafolioCorte;
}) {
  const [imagenFallida, setImagenFallida] = useState(false);
  const imagenUrl = resolverUrlArchivo(publicacion.imagenUrl);
  const mostrarImagen = Boolean(imagenUrl) && !imagenFallida;

  return (
    <article className="group relative h-64 overflow-hidden rounded-lg border border-[#d4af37]/20 bg-[#090909] shadow-lg shadow-black/20">
      {mostrarImagen ? (
        <img
          alt={publicacion.titulo}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() => setImagenFallida(true)}
          src={imagenUrl ?? undefined}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.18),transparent_35%),linear-gradient(145deg,#171717,#050505)]">
          <ImageIcon aria-hidden="true" className="text-[#d4af37]/70" size={42} strokeWidth={1.4} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <span className="text-sm font-bold text-[#f5d77b]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="text-2xl font-black text-white drop-shadow-lg">{publicacion.titulo}</p>
      </div>
    </article>
  );
}
