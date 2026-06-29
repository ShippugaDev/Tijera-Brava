"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificacionCard } from "@/components/barbero/notificaciones/NotificacionCard";
import {
  NotificacionesFiltros,
  type FiltroNotificaciones
} from "@/components/barbero/notificaciones/NotificacionesFiltros";
import { NotificacionesResumen } from "@/components/barbero/notificaciones/NotificacionesResumen";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import {
  contarNotificacionesNoLeidas,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas
} from "@/lib/barbero-notificaciones-api";
import type { Notificacion, UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones"
];

const prefijosPorFiltro: Partial<Record<FiltroNotificaciones, string>> = {
  RESERVAS: "RESERVA_",
  PAGOS: "PAGO_",
  PORTAFOLIO: "PORTAFOLIO_",
  CALIFICACIONES: "CALIFICACION_"
};

export default function BarberoNotificacionesPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <NotificacionesContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function NotificacionesContent({ usuario }: { usuario: UsuarioSesion }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [filtro, setFiltro] = useState<FiltroNotificaciones>("TODAS");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [confirmarTodas, setConfirmarTodas] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [notificacionesResponse, totalResponse] = await Promise.all([
        listarNotificaciones({ pagina: 1, limite: 50 }),
        contarNotificacionesNoLeidas()
      ]);
      setNotificaciones(notificacionesResponse.datos ?? []);
      setTotalNoLeidas(totalResponse.datos.total ?? 0);
    } catch {
      setNotificaciones([]);
      setTotalNoLeidas(0);
      setError("No se pudieron cargar tus notificaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const notificacionesFiltradas = useMemo(() => {
    if (filtro === "NO_LEIDAS") return notificaciones.filter((item) => !item.leida);
    if (filtro === "LEIDAS") return notificaciones.filter((item) => item.leida);
    const prefijo = prefijosPorFiltro[filtro];
    if (prefijo) return notificaciones.filter((item) => item.tipo.startsWith(prefijo));
    return notificaciones;
  }, [filtro, notificaciones]);

  const marcarUna = async (idNotificacion: string) => {
    setError("");
    setExito("");
    setProcesando(true);
    try {
      const response = await marcarNotificacionLeida(idNotificacion);
      const actualizada = response.datos.notificacion;
      setNotificaciones((items) =>
        items.map((item) =>
          item.idNotificacion === idNotificacion ? { ...item, ...actualizada } : item
        )
      );
      const totalResponse = await contarNotificacionesNoLeidas();
      setTotalNoLeidas(totalResponse.datos.total ?? 0);
      setExito("Notificación marcada como leída correctamente.");
    } catch {
      setError("No se pudo marcar la notificación como leída.");
    } finally {
      setProcesando(false);
    }
  };

  const marcarTodas = async () => {
    setError("");
    setExito("");
    setProcesando(true);
    try {
      await marcarTodasNotificacionesLeidas();
      setConfirmarTodas(false);
      setExito("Notificaciones marcadas como leídas correctamente.");
      await cargar();
    } catch {
      setError("No se pudieron marcar todas como leídas.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Revisa alertas sobre reservas, pagos, calificaciones y moderaciones."
      sidebarItems={sidebarItems}
      titulo="Mis notificaciones"
      usuario={usuario}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#b5b5b5]">
          Mantente al tanto de lo que ocurre con tus servicios a domicilio.
        </p>
        <button
          className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={totalNoLeidas === 0 || procesando}
          onClick={() => setConfirmarTodas(true)}
          type="button"
        >
          Marcar todas como leídas
        </button>
      </div>

      <NotificacionesResumen totalNoLeidas={totalNoLeidas} notificaciones={notificaciones} />

      <div className="mt-6">
        <NotificacionesFiltros filtro={filtro} onChange={setFiltro} />
      </div>

      <div className="mt-5 space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando notificaciones..." /> : null}

      {!cargando && notificacionesFiltradas.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          No tienes notificaciones para este filtro.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {notificacionesFiltradas.map((notificacion) => (
          <NotificacionCard
            cargando={procesando}
            key={notificacion.idNotificacion}
            notificacion={notificacion}
            onMarcarLeida={marcarUna}
          />
        ))}
      </div>

      <ConfirmModal
        abierto={confirmarTodas}
        cargando={procesando}
        confirmLabel="Sí, marcar todas"
        loadingLabel="Marcando..."
        mensaje="¿Deseas marcar todas tus notificaciones como leídas?"
        onCancel={() => setConfirmarTodas(false)}
        onConfirm={marcarTodas}
        titulo="Marcar todas como leídas"
      />
    </RoleLayout>
  );
}
