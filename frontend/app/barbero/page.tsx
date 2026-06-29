"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { DashboardCard, SummaryCard } from "@/components/ui/DashboardCard";
import { resolverUrlArchivo } from "@/lib/api";
import {
  obtenerMiPerfilBarbero,
  type PerfilBarberoPrivado
} from "@/lib/barbero-perfil-api";
import type { UsuarioSesion } from "@/lib/types";

const modulos = [
  {
    icono: "MR",
    titulo: "Mis reservas",
    descripcion: "Atiende solicitudes, confirma servicios y gestiona estados.",
    href: "/barbero/reservas"
  },
  {
    icono: "HD",
    titulo: "Mi disponibilidad",
    descripcion: "Configura horarios recurrentes y bloqueos de agenda.",
    href: "/barbero/disponibilidad"
  },
  {
    icono: "PF",
    titulo: "Mi portafolio",
    descripcion: "Publica trabajos y muestra tu estilo a nuevos clientes.",
    href: "/barbero/portafolio"
  },
  {
    icono: "SV",
    titulo: "Mis servicios",
    descripcion: "Gestiona los cortes y precios que ofreces.",
    href: "/barbero/servicios"
  },
  {
    icono: "NT",
    titulo: "Mis notificaciones",
    descripcion: "Revisa alertas sobre reservas, pagos y moderaciones.",
    href: "/barbero/notificaciones"
  },
  {
    icono: "MP",
    titulo: "Mi perfil",
    descripcion: "Actualiza tu foto y datos visibles para clientes.",
    href: "/barbero/perfil"
  }
];

const resumen = [
  ["Reservas pendientes", "0", "Por confirmar"],
  ["Servicios activos", "Listos", "Catálogo visual"],
  ["Calificación promedio", "4.8", "Referencia"],
  ["Notificaciones nuevas", "0", "Sin pendientes"]
];

const inicialesBarbero = (usuario: UsuarioSesion, nombreProfesional?: string | null) =>
  (nombreProfesional || `${usuario.nombres} ${usuario.apellidos ?? ""}`.trim() || "Barbero")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("") || "TB";

function FotoDashboard({
  iniciales,
  url
}: {
  iniciales: string;
  url?: string | null;
}) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-[#17110a] text-2xl font-black text-[#f5d77b]">
        {iniciales}
      </div>
    );
  }

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-black">
      <img
        alt="Foto de perfil del barbero"
        className="h-full w-full object-cover"
        onError={() => setFallo(true)}
        src={url}
      />
    </div>
  );
}

export default function BarberoPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <BarberoDashboard usuario={usuario} />}
    </ProtectedRoute>
  );
}

function BarberoDashboard({ usuario }: { usuario: UsuarioSesion }) {
  const [perfil, setPerfil] = useState<PerfilBarberoPrivado | null>(null);

  useEffect(() => {
    obtenerMiPerfilBarbero()
      .then((response) => setPerfil(response.datos))
      .catch(() => null);
  }, []);

  const nombreProfesional = perfil?.barbero.nombreProfesional;
  const fotoUrl = resolverUrlArchivo(
    perfil?.usuario.fotoPerfilUrl ?? perfil?.barbero.fotoPerfilUrl ?? usuario.fotoPerfilUrl
  );

  return (
    <RoleLayout
      descripcion="Administra tus servicios, disponibilidad y reservas desde tu panel profesional."
      sidebarItems={modulos.map((modulo) => modulo.titulo)}
      titulo={`Bienvenido, ${usuario.nombres}`}
      usuario={{ ...usuario, fotoPerfilUrl: perfil?.usuario.fotoPerfilUrl ?? usuario.fotoPerfilUrl }}
    >
      <Card className="mb-6 border-[#d4af37]/20 bg-[#0d0d0d]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <FotoDashboard
              iniciales={inicialesBarbero(usuario, nombreProfesional)}
              url={fotoUrl}
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
                BARBERO
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {nombreProfesional ?? `${usuario.nombres} ${usuario.apellidos ?? ""}`.trim()}
              </h2>
              <p className="mt-1 text-sm text-[#b5b5b5]">
                Tu foto se mostrará en el listado y perfil público.
              </p>
            </div>
          </div>
          <a
            className="rounded-lg bg-[#d4af37] px-5 py-3 text-center text-sm font-black text-black hover:bg-[#f5d77b]"
            href="/barbero/perfil"
          >
            Actualizar foto
          </a>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {resumen.map(([titulo, valor, detalle]) => (
          <SummaryCard detalle={detalle} key={titulo} titulo={titulo} valor={valor} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modulos.map((modulo) => (
          <DashboardCard
            descripcion={modulo.descripcion}
            href={modulo.href}
            icono={modulo.icono}
            key={modulo.titulo}
            titulo={modulo.titulo}
          />
        ))}
      </div>
    </RoleLayout>
  );
}
