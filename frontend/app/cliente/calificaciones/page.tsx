"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CalificacionCard } from "@/components/cliente/calificaciones/CalificacionCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { FormError } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { listarMisCalificaciones } from "@/lib/calificaciones-api";
import type { CalificacionCliente, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

export default function ClienteCalificacionesPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <CalificacionesContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function CalificacionesContent({ usuario }: { usuario: UsuarioSesion }) {
  const [calificaciones, setCalificaciones] = useState<CalificacionCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    listarMisCalificaciones({ pagina: 1, limite: 20 })
      .then((response) => {
        if (!activo) return;
        setCalificaciones(response.datos ?? []);
      })
      .catch(() => {
        if (!activo) return;
        setCalificaciones([]);
        setError("No se pudieron cargar tus calificaciones.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <RoleLayout
      descripcion="Revisa las opiniones que dejaste sobre tus servicios."
      sidebarItems={sidebarItems}
      titulo="Mis calificaciones"
      usuario={usuario}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#b5b5b5]">
          Tus opiniones ayudan a mantener la calidad del servicio a domicilio.
        </p>
        <Link
          className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-center text-sm font-black text-black hover:bg-[#f5d77b]"
          href="/cliente/calificaciones/nueva"
        >
          Calificar servicio
        </Link>
      </div>

      <FormError mensaje={error} />
      {cargando ? <Loading texto="Cargando calificaciones..." /> : null}

      {!cargando && calificaciones.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          Aún no has realizado calificaciones. Cuando finalice un servicio, podrás dejar tu opinión.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {calificaciones.map((calificacion) => (
          <CalificacionCard calificacion={calificacion} key={calificacion.idCalificacion} />
        ))}
      </div>
    </RoleLayout>
  );
}
