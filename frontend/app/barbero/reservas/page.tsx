"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ReservaBarberoCard } from "@/components/barbero/reservas/ReservaBarberoCard";
import { type AccionReservaBarbero } from "@/components/barbero/reservas/ReservaEstadoActions";
import { RechazarReservaModal } from "@/components/barbero/reservas/RechazarReservaModal";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import {
  aceptarReservaBarbero,
  cancelarReservaBarbero,
  finalizarServicioReserva,
  iniciarServicioReserva,
  listarReservasBarbero,
  marcarReservaEnCamino,
  rechazarReservaBarbero
} from "@/lib/barbero-reservas-api";
import type { ReservaBarbero, UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones"
];

const estados = [
  "TODAS",
  "PENDIENTE",
  "CONFIRMADA",
  "EN_CAMINO",
  "EN_SERVICIO",
  "FINALIZADA",
  "CANCELADA",
  "RECHAZADA"
];

const accionesConfirmacion: Partial<Record<AccionReservaBarbero, { titulo: string; mensaje: string; label: string }>> = {
  aceptar: {
    titulo: "Aceptar reserva",
    mensaje: "¿Seguro que deseas aceptar esta reserva? El cliente será notificado del cambio.",
    label: "Sí, aceptar"
  },
  "en-camino": {
    titulo: "Marcar en camino",
    mensaje: "¿Seguro que deseas marcar esta reserva como en camino?",
    label: "Sí, marcar"
  },
  iniciar: {
    titulo: "Iniciar servicio",
    mensaje: "¿Seguro que deseas iniciar el servicio de esta reserva?",
    label: "Sí, iniciar"
  },
  finalizar: {
    titulo: "Finalizar servicio",
    mensaje: "¿Seguro que deseas finalizar el servicio de esta reserva?",
    label: "Sí, finalizar"
  }
};

export default function BarberoReservasPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <ReservasBarberoContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function ReservasBarberoContent({ usuario }: { usuario: UsuarioSesion }) {
  const [reservas, setReservas] = useState<ReservaBarbero[]>([]);
  const [estado, setEstado] = useState("TODAS");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [accionActual, setAccionActual] = useState<{
    reserva: ReservaBarbero;
    accion: AccionReservaBarbero;
  } | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await listarReservasBarbero({ pagina: 1, limite: 50 });
      setReservas(response.datos ?? []);
    } catch {
      setReservas([]);
      setError("No se pudieron cargar tus reservas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const reservasFiltradas = useMemo(() => {
    if (estado === "TODAS") return reservas;
    if (estado === "CANCELADA") {
      return reservas.filter((reserva) => reserva.estadoReserva.startsWith("CANCELADA"));
    }
    return reservas.filter((reserva) => reserva.estadoReserva === estado);
  }, [estado, reservas]);

  const ejecutarAccion = async (motivo?: string) => {
    if (!accionActual) return;
    setProcesando(true);
    setError("");
    setExito("");
    try {
      const { reserva, accion } = accionActual;
      if (accion === "aceptar") await aceptarReservaBarbero(reserva.idReserva);
      if (accion === "en-camino") await marcarReservaEnCamino(reserva.idReserva);
      if (accion === "iniciar") await iniciarServicioReserva(reserva.idReserva);
      if (accion === "finalizar") await finalizarServicioReserva(reserva.idReserva);
      if (accion === "rechazar") {
        if (!motivo) throw new Error("motivo");
        await rechazarReservaBarbero(reserva.idReserva, motivo);
      }
      if (accion === "cancelar") {
        if (!motivo) throw new Error("motivo");
        await cancelarReservaBarbero(reserva.idReserva, motivo);
      }
      setExito("Reserva actualizada correctamente.");
      setAccionActual(null);
      await cargar();
    } catch (errorAccion) {
      if (errorAccion instanceof Error && errorAccion.message === "motivo") {
        setError("Ingresa un motivo para rechazar o cancelar.");
      } else {
        setError("No se pudo cambiar el estado. Esta reserva ya no permite esa acción.");
      }
    } finally {
      setProcesando(false);
    }
  };

  const confirmacion = accionActual ? accionesConfirmacion[accionActual.accion] : undefined;
  const esModalMotivo = accionActual?.accion === "rechazar" || accionActual?.accion === "cancelar";

  return (
    <RoleLayout
      descripcion="Gestiona las solicitudes y servicios asignados a tu perfil."
      sidebarItems={sidebarItems}
      titulo="Mis reservas"
      usuario={usuario}
    >
      <div className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
        <label className="block max-w-xs text-sm font-medium text-neutral-200">
          Estado
          <select
            className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
          >
            {estados.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando reservas asignadas..." /> : null}

      {!cargando && reservasFiltradas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          Aún no tienes reservas asignadas.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {reservasFiltradas.map((reserva) => (
          <ReservaBarberoCard
            accionEnCurso={procesando && accionActual?.reserva.idReserva === reserva.idReserva}
            key={reserva.idReserva}
            onAction={(reservaSeleccionada, accion) =>
              setAccionActual({ reserva: reservaSeleccionada, accion })
            }
            reserva={reserva}
          />
        ))}
      </div>

      <ConfirmModal
        abierto={Boolean(confirmacion && !esModalMotivo)}
        cargando={procesando}
        confirmLabel={confirmacion?.label ?? "Confirmar"}
        loadingLabel="Procesando..."
        mensaje={confirmacion?.mensaje ?? ""}
        onCancel={() => setAccionActual(null)}
        onConfirm={() => ejecutarAccion()}
        titulo={confirmacion?.titulo ?? "Confirmar acción"}
      />
      <RechazarReservaModal
        abierto={Boolean(esModalMotivo)}
        cargando={procesando}
        confirmLabel={accionActual?.accion === "rechazar" ? "Sí, rechazar" : "Sí, cancelar"}
        loadingLabel="Procesando..."
        mensaje={
          accionActual?.accion === "rechazar"
            ? "Indica por qué no podrás aceptar esta reserva."
            : "Indica por qué necesitas cancelar esta reserva."
        }
        onCancel={() => setAccionActual(null)}
        onConfirm={ejecutarAccion}
        titulo={accionActual?.accion === "rechazar" ? "Rechazar reserva" : "Cancelar reserva"}
      />
    </RoleLayout>
  );
}
