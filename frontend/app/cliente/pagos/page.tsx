"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PagoReservaCard } from "@/components/cliente/pagos/PagoReservaCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { FormError } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { listarMisReservas } from "@/lib/cliente-api";
import type { ReservaCliente, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

export default function ClientePagosPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <PagosContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function PagosContent({ usuario }: { usuario: UsuarioSesion }) {
  const [reservas, setReservas] = useState<ReservaCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    listarMisReservas({ pagina: 1, limite: 20 })
      .then((response) => {
        if (!activo) return;
        setReservas(response.datos ?? []);
      })
      .catch(() => {
        if (!activo) return;
        setReservas([]);
        setError("No se pudieron cargar tus pagos.");
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
      descripcion="Consulta pagos asociados a tus reservas y registra comprobantes pendientes."
      sidebarItems={sidebarItems}
      titulo="Mis pagos"
      usuario={usuario}
    >
      <div className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
        <p className="text-sm leading-6 text-[#b5b5b5]">
          Cada reserva genera un pago asociado. Abre el detalle para ver estado, comprobante e
          historial.
        </p>
      </div>

      <FormError mensaje={error} />
      {cargando ? <Loading texto="Cargando pagos..." /> : null}

      {!cargando && reservas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          Aún no tienes pagos registrados. Crea una reserva para generar un pago.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {reservas.map((reserva) => (
          <PagoReservaCard key={reserva.idReserva} reserva={reserva} />
        ))}
      </div>
    </RoleLayout>
  );
}
