"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HistorialReserva } from "@/components/barbero/reservas/HistorialReserva";
import { ReservaDetalleBarbero } from "@/components/barbero/reservas/ReservaDetalleBarbero";
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
  marcarReservaEnCamino,
  obtenerHistorialReservaBarbero,
  obtenerReservaBarbero,
  rechazarReservaBarbero
} from "@/lib/barbero-reservas-api";
import type { HistorialReserva as HistorialReservaType, ReservaBarbero, UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones"
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

export default function DetalleReservaBarberoPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <DetalleReservaContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function DetalleReservaContent({ usuario }: { usuario: UsuarioSesion }) {
  const params = useParams<{ id: string }>();
  const idReserva = params.id;
  const [reserva, setReserva] = useState<ReservaBarbero | null>(null);
  const [historial, setHistorial] = useState<HistorialReservaType[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [accionActual, setAccionActual] = useState<AccionReservaBarbero | null>(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [reservaResponse, historialResponse] = await Promise.all([
        obtenerReservaBarbero(idReserva),
        obtenerHistorialReservaBarbero(idReserva).catch(() => null)
      ]);
      setReserva(reservaResponse.datos.reserva);
      setHistorial(historialResponse?.datos.historial ?? []);
    } catch {
      setReserva(null);
      setHistorial([]);
      setError("No se pudo consultar el detalle de la reserva.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idReserva]);

  const ejecutarAccion = async (motivo?: string) => {
    if (!accionActual || !reserva) return;
    setProcesando(true);
    setError("");
    setExito("");
    try {
      let response;
      if (accionActual === "aceptar") response = await aceptarReservaBarbero(reserva.idReserva);
      if (accionActual === "en-camino") response = await marcarReservaEnCamino(reserva.idReserva);
      if (accionActual === "iniciar") response = await iniciarServicioReserva(reserva.idReserva);
      if (accionActual === "finalizar") response = await finalizarServicioReserva(reserva.idReserva);
      if (accionActual === "rechazar") {
        if (!motivo) throw new Error("motivo");
        response = await rechazarReservaBarbero(reserva.idReserva, motivo);
      }
      if (accionActual === "cancelar") {
        if (!motivo) throw new Error("motivo");
        response = await cancelarReservaBarbero(reserva.idReserva, motivo);
      }
      if (response) setReserva(response.datos.reserva);
      setExito("Reserva actualizada correctamente.");
      setAccionActual(null);
      const historialResponse = await obtenerHistorialReservaBarbero(idReserva).catch(() => null);
      setHistorial(historialResponse?.datos.historial ?? []);
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

  const confirmacion = accionActual ? accionesConfirmacion[accionActual] : undefined;
  const esModalMotivo = accionActual === "rechazar" || accionActual === "cancelar";

  return (
    <RoleLayout
      descripcion="Revisa la información completa del servicio y gestiona su estado."
      sidebarItems={sidebarItems}
      titulo="Detalle de reserva"
      usuario={usuario}
    >
      <div className="mb-6">
        <Link className="text-sm font-black text-[#f5d77b] hover:text-white" href="/barbero/reservas">
          Volver a Mis reservas
        </Link>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando reserva..." /> : null}

      {!cargando && reserva ? (
        <div className="mt-5 grid gap-6">
          <ReservaDetalleBarbero
            accionEnCurso={procesando}
            onAction={setAccionActual}
            reserva={reserva}
          />
          <HistorialReserva historial={historial} />
        </div>
      ) : null}

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
        confirmLabel={accionActual === "rechazar" ? "Sí, rechazar" : "Sí, cancelar"}
        loadingLabel="Procesando..."
        mensaje={
          accionActual === "rechazar"
            ? "Indica por qué no podrás aceptar esta reserva."
            : "Indica por qué necesitas cancelar esta reserva."
        }
        onCancel={() => setAccionActual(null)}
        onConfirm={ejecutarAccion}
        titulo={accionActual === "rechazar" ? "Rechazar reserva" : "Cancelar reserva"}
      />
    </RoleLayout>
  );
}
