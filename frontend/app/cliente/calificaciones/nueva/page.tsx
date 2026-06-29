"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CalificacionForm } from "@/components/cliente/calificaciones/CalificacionForm";
import { ReservaCalificableCard } from "@/components/cliente/calificaciones/ReservaCalificableCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { crearCalificacion, listarMisCalificaciones } from "@/lib/calificaciones-api";
import { listarMisReservas } from "@/lib/cliente-api";
import type { CalificacionCliente, ReservaCliente, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

export default function NuevaCalificacionPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <NuevaCalificacionContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function NuevaCalificacionContent({ usuario }: { usuario: UsuarioSesion }) {
  const router = useRouter();
  const [reservas, setReservas] = useState<ReservaCliente[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionCliente[]>([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaCliente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    let activo = true;
    Promise.all([
      listarMisReservas({ estado: "FINALIZADA", pagina: 1, limite: 50 }),
      listarMisCalificaciones({ pagina: 1, limite: 100 })
    ])
      .then(([reservasResponse, calificacionesResponse]) => {
        if (!activo) return;
        setReservas((reservasResponse.datos ?? []).filter((reserva) => reserva.estadoReserva === "FINALIZADA"));
        setCalificaciones(calificacionesResponse.datos ?? []);
      })
      .catch(() => {
        if (!activo) return;
        setReservas([]);
        setCalificaciones([]);
        setError("No se pudieron cargar tus reservas finalizadas.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const reservasCalificadas = useMemo(
    () => new Set(calificaciones.map((calificacion) => calificacion.idReserva)),
    [calificaciones]
  );

  const enviar = async (payload: { puntuacion: number; comentario?: string }) => {
    setError("");
    setExito("");

    if (!reservaSeleccionada || reservaSeleccionada.estadoReserva !== "FINALIZADA") {
      setError("Selecciona una reserva finalizada.");
      return;
    }
    if (reservasCalificadas.has(reservaSeleccionada.idReserva)) {
      setError("Esta reserva ya cuenta con una calificación registrada.");
      return;
    }
    if (payload.puntuacion < 1 || payload.puntuacion > 5) {
      setError("La puntuación debe estar entre 1 y 5.");
      return;
    }
    if ((payload.comentario?.length ?? 0) > 500) {
      setError("El comentario no debe superar 500 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      await crearCalificacion({
        idReserva: reservaSeleccionada.idReserva,
        puntuacion: payload.puntuacion,
        comentario: payload.comentario
      });
      setExito("Calificación registrada correctamente.");
      router.push("/cliente/calificaciones");
    } catch {
      setError("Esta reserva ya fue calificada o no se pudo registrar la calificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Elige una reserva finalizada y registra tu opinión del servicio."
      sidebarItems={sidebarItems}
      titulo="Calificar servicio"
      usuario={usuario}
    >
      <div className="mb-6">
        <Link
          className="text-sm font-black text-[#f5d77b] hover:text-white"
          href="/cliente/calificaciones"
        >
          Volver a Mis calificaciones
        </Link>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando reservas finalizadas..." /> : null}

      {!cargando && reservas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          No tienes reservas finalizadas disponibles para calificar.
        </div>
      ) : null}

      {!cargando && reservas.length > 0 ? (
        <div className="mt-5 grid gap-6">
          <section>
            <h2 className="text-xl font-black text-white">Reservas finalizadas</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {reservas.map((reserva) => (
                <ReservaCalificableCard
                  key={reserva.idReserva}
                  onSelect={setReservaSeleccionada}
                  reserva={reserva}
                  seleccionada={reservaSeleccionada?.idReserva === reserva.idReserva}
                  yaCalificada={reservasCalificadas.has(reserva.idReserva)}
                />
              ))}
            </div>
          </section>

          {reservaSeleccionada ? (
            <CalificacionForm cargando={enviando} onSubmit={enviar} />
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 text-sm text-[#b5b5b5]">
              Selecciona una reserva finalizada para habilitar el formulario.
            </div>
          )}
        </div>
      ) : null}
    </RoleLayout>
  );
}
