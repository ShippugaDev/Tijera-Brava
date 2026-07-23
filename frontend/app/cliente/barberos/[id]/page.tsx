"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useState as useReactState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormMessage";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Loading } from "@/components/ui/Loading";
import { resolverUrlArchivo } from "@/lib/api";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import {
  listarCalificacionesBarbero,
  listarPortafolioBarbero,
  listarServiciosBarbero,
  listarZonasBarbero,
  obtenerBarbero
} from "@/lib/cliente-api";
import type {
  BarberoPublico,
  CalificacionCliente,
  PortafolioCorte,
  ServicioBarbero,
  UsuarioSesion,
  ZonaBarbero
} from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

const formatoFecha = (fecha?: string | null) =>
  fecha ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha)) : "Sin fecha";

const esPortafolioVisible = (publicacion: PortafolioCorte) =>
  publicacion.estadoVisibilidad !== "OCULTO" && publicacion.estadoVisibilidad !== "ELIMINADO";

const esCalificacionVisible = (calificacion: CalificacionCliente) =>
  calificacion.estadoVisibilidad !== "OCULTA" &&
  calificacion.estadoVisibilidad !== "OCULTO" &&
  calificacion.estadoVisibilidad !== "ELIMINADO";

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

const obtenerInicialesBarbero = (barbero: BarberoPublico) => {
  const nombreBase =
    barbero.nombreProfesional ||
    `${barbero.usuario?.nombres ?? ""} ${barbero.usuario?.apellidos ?? ""}`.trim() ||
    "Barbero";

  return nombreBase
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
};

function FotoPerfilBarbero({ barbero }: { barbero: BarberoPublico }) {
  const [fallo, setFallo] = useReactState(false);
  const fotoUrl = resolverUrlArchivo(obtenerFotoPerfilBarbero(barbero));
  const iniciales = obtenerInicialesBarbero(barbero);

  if (!fotoUrl || fallo) {
    return (
      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-gradient-to-br from-[#2a2110] to-black text-3xl font-black text-[#f5d77b] shadow-[0_0_35px_rgba(212,175,55,0.14)] sm:h-32 sm:w-32">
        {iniciales || "TB"}
      </div>
    );
  }

  return (
    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-black shadow-[0_0_35px_rgba(212,175,55,0.14)] sm:h-32 sm:w-32">
      <img
        alt={`Foto de ${barbero.nombreProfesional}`}
        className="h-full w-full object-cover"
        onError={() => setFallo(true)}
        src={fotoUrl}
      />
    </div>
  );
}

function PortafolioImagen({
  imagenUrl,
  titulo,
  onAmpliar
}: {
  imagenUrl?: string | null;
  titulo: string;
  onAmpliar: () => void;
}) {
  const [fallo, setFallo] = useReactState(false);

  if (!imagenUrl || fallo) {
    return (
      <div className="mt-4 flex h-56 items-center justify-center rounded-lg border border-dashed border-[#d4af37]/25 bg-black/30 px-5 text-center text-sm text-[#b5b5b5]">
        Vista previa no disponible
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
      <img
        alt={titulo}
        className="h-56 w-full cursor-pointer object-cover transition duration-300 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]"
        onClick={onAmpliar}
        onError={() => setFallo(true)}
        src={imagenUrl}
      />
    </div>
  );
}

function PortafolioPublicacionCard({
  publicacion,
  onImagenClick
}: {
  publicacion: PortafolioCorte;
  onImagenClick: (imagenUrl: string, titulo: string) => void;
}) {
  const imagenUrl = resolverUrlArchivo(publicacion.imagenUrl);

  return (
    <article className="rounded-xl border border-white/10 bg-[#171717] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white">{publicacion.titulo}</h3>
          <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
            {publicacion.descripcion || "Sin descripción registrada."}
          </p>
        </div>
        {publicacion.destacado ? (
          <span className={getEstadoBadgeClass("DESTACADA")}>
            DESTACADA
          </span>
        ) : null}
      </div>
      <PortafolioImagen
        imagenUrl={imagenUrl}
        onAmpliar={() => imagenUrl && onImagenClick(imagenUrl, publicacion.titulo)}
        titulo={publicacion.titulo}
      />
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#b5b5b5]">
        <span className="rounded-full border border-white/10 px-3 py-1">
          {publicacion.categoria?.nombre ?? "Sin categoría"}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          {formatoFecha(publicacion.fechaCreacion)}
        </span>
      </div>
    </article>
  );
}

function CalificacionPublicaCard({ calificacion }: { calificacion: CalificacionCliente }) {
  const cliente = `${calificacion.cliente?.nombres ?? ""} ${calificacion.cliente?.apellidos ?? ""}`.trim();

  return (
    <article className="rounded-xl border border-white/10 bg-[#171717] p-5">
      <p className="text-lg font-black text-[#f5d77b]">
        {"★".repeat(Math.max(0, Math.min(calificacion.puntuacion, 5)))}
        <span className="ml-2 text-sm text-[#b5b5b5]">{calificacion.puntuacion}/5</span>
      </p>
      <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
        {calificacion.comentario || "Sin comentario registrado."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#b5b5b5]">
        <span className="rounded-full border border-white/10 px-3 py-1">
          {cliente || "Cliente"}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          {formatoFecha(calificacion.fechaCreacion)}
        </span>
      </div>
    </article>
  );
}

export default function PerfilBarberoPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <PerfilContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function PerfilContent({ usuario }: { usuario: UsuarioSesion }) {
  const params = useParams<{ id: string }>();
  const idBarbero = params.id;
  const [barbero, setBarbero] = useState<BarberoPublico | null>(null);
  const [servicios, setServicios] = useState<ServicioBarbero[]>([]);
  const [zonas, setZonas] = useState<ZonaBarbero[]>([]);
  const [portafolio, setPortafolio] = useState<PortafolioCorte[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionCliente[]>([]);
  const [calificacionesTotal, setCalificacionesTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [imagenAmpliada, setImagenAmpliada] = useState<{ url: string; titulo: string } | null>(
    null
  );

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const [perfilResult, serviciosResult, zonasResult, portafolioResult, calificacionesResult] =
          await Promise.allSettled([
            obtenerBarbero(idBarbero),
            listarServiciosBarbero(idBarbero),
            listarZonasBarbero(idBarbero),
            listarPortafolioBarbero(idBarbero),
            listarCalificacionesBarbero(idBarbero)
          ]);

        if (!activo) return;

        if (perfilResult.status === "fulfilled") {
          const datos = perfilResult.value.datos;
          setBarbero(datos.barbero ?? datos);
        } else {
          setBarbero({
            idBarbero,
            nombreProfesional: "Barbero seleccionado",
            biografia: "Perfil básico disponible. El endpoint público de detalle del barbero aún no respondió.",
            disponible: true
          });
        }

        if (serviciosResult.status === "fulfilled") setServicios(serviciosResult.value.datos);
        if (zonasResult.status === "fulfilled") setZonas(zonasResult.value.datos);
        if (portafolioResult.status === "fulfilled") {
          setPortafolio((portafolioResult.value.datos ?? []).filter(esPortafolioVisible));
        }
        if (calificacionesResult.status === "fulfilled") {
          const visibles = (calificacionesResult.value.datos.calificaciones ?? []).filter(
            esCalificacionVisible
          );
          setCalificaciones(visibles);
          setCalificacionesTotal(
            calificacionesResult.value.datos.resumen?.totalCalificaciones ?? visibles.length
          );
        }
      } catch {
        setError("No se pudo cargar el perfil del barbero.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [idBarbero]);

  return (
    <RoleLayout
      descripcion="Revisa servicios, zonas de atención y referencias antes de crear tu reserva."
      sidebarItems={sidebarItems}
      titulo={barbero?.nombreProfesional ?? "Perfil de barbero"}
      usuario={usuario}
    >
      {cargando ? <Loading texto="Cargando perfil..." /> : null}
      <FormError mensaje={error} />
      {!cargando && barbero ? (
        <div className="space-y-6">
          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <FotoPerfilBarbero barbero={barbero} />
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">Barbero verificado</p>
                  <h1 className="mt-3 text-3xl font-black">{barbero.nombreProfesional}</h1>
                  <p className="mt-4 max-w-3xl leading-7 text-[#b5b5b5]">
                    {barbero.biografia || "Especialista en cortes masculinos a domicilio."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[#b5b5b5]">
                      {barbero.anosExperiencia ?? barbero.aniosExperiencia ?? 0} años de experiencia
                    </span>
                    <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[#f5d77b]">
                      Calificación {Number(barbero.calificacionPromedio ?? 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                className="rounded-lg bg-[#d4af37] px-5 py-3 text-center text-sm font-black text-black hover:bg-[#f5d77b] lg:shrink-0"
                href={`/cliente/reservas/nueva?idBarbero=${idBarbero}`}
              >
                Reservar con este barbero
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-white/10 bg-[#171717]">
              <p className="text-sm text-[#b5b5b5]">Servicios ofrecidos</p>
              <p className="mt-2 text-3xl font-black">{servicios.length}</p>
            </Card>
            <Card className="border-white/10 bg-[#171717]">
              <p className="text-sm text-[#b5b5b5]">Zonas de atención</p>
              <p className="mt-2 text-3xl font-black">{zonas.length}</p>
            </Card>
            <Card className="border-white/10 bg-[#171717]">
              <p className="text-sm text-[#b5b5b5]">Comentarios recientes</p>
              <p className="mt-2 text-3xl font-black">{calificacionesTotal}</p>
            </Card>
          </div>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
              <h2 className="text-xl font-black">Servicios</h2>
              <div className="mt-4 grid gap-3">
                {servicios.map((servicio) => (
                  <div className="rounded-lg border border-white/10 bg-[#171717] p-4" key={servicio.idServicio}>
                    <p className="font-black">{servicio.servicio?.nombre ?? servicio.nombre}</p>
                    <p className="mt-2 text-sm text-[#b5b5b5]">
                      S/ {Number(servicio.precioFinal ?? servicio.precioPersonalizado ?? servicio.servicio?.precioBase ?? 0).toFixed(2)} · {servicio.duracionFinal ?? servicio.servicio?.duracionMinutos ?? "-"} min
                    </p>
                  </div>
                ))}
                {servicios.length === 0 ? <p className="text-sm text-[#b5b5b5]">No hay servicios publicados.</p> : null}
              </div>
            </Card>

            <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
              <h2 className="text-xl font-black">Zonas de cobertura</h2>
              <div className="mt-4 grid gap-3">
                {zonas.map((zona) => (
                  <div className="rounded-lg border border-white/10 bg-[#171717] p-4" key={zona.idZonaCobertura}>
                    <p className="font-black">{zona.zonaCobertura?.nombre ?? zona.nombre}</p>
                    <p className="mt-2 text-sm text-[#b5b5b5]">
                      {zona.zonaCobertura?.distrito ?? zona.distrito} · Traslado S/ {Number(zona.costoTraslado ?? 0).toFixed(2)}
                    </p>
                  </div>
                ))}
                {zonas.length === 0 ? <p className="text-sm text-[#b5b5b5]">No hay zonas publicadas.</p> : null}
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-white">Portafolio del barbero</h2>
              <p className="mt-2 text-sm text-[#b5b5b5]">
                Trabajos visibles publicados por este profesional.
              </p>
            </div>
            {portafolio.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {portafolio.map((publicacion) => (
                  <PortafolioPublicacionCard
                    key={publicacion.idPortafolioCorte}
                    onImagenClick={(url, titulo) => setImagenAmpliada({ url, titulo })}
                    publicacion={publicacion}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
                Este barbero aún no tiene trabajos visibles en su portafolio.
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-white">Reseñas recientes</h2>
              <p className="mt-2 text-sm text-[#b5b5b5]">
                Calificaciones visibles: {calificacionesTotal}.
              </p>
            </div>
            {calificaciones.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {calificaciones.map((calificacion) => (
                  <CalificacionPublicaCard
                    calificacion={calificacion}
                    key={calificacion.idCalificacion}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
                Este barbero aún no tiene reseñas visibles.
              </Card>
            )}
          </section>
        </div>
      ) : null}
      <ImageLightbox
        alt={imagenAmpliada?.titulo}
        onClose={() => setImagenAmpliada(null)}
        src={imagenAmpliada?.url ?? null}
      />
    </RoleLayout>
  );
}
