"use client";

import { useCallback, useEffect, useState } from "react";
import { CalificacionModeracionCard } from "@/components/administrador/moderacion/CalificacionModeracionCard";
import { ModeracionModal } from "@/components/administrador/moderacion/ModeracionModal";
import { ModeracionTabs } from "@/components/administrador/moderacion/ModeracionTabs";
import { PortafolioModeracionCard } from "@/components/administrador/moderacion/PortafolioModeracionCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { adminSidebarItems } from "@/lib/admin-navigation";
import {
  listarCalificacionesModeracionAdmin,
  listarPortafoliosModeracionAdmin,
  moderarCalificacionAdmin,
  moderarPortafolioAdmin
} from "@/lib/admin-moderacion-api";
import type {
  CalificacionModeracion,
  EstadoVisibilidadCalificacionModeracion,
  EstadoVisibilidadPortafolioModeracion,
  PortafolioModeracion
} from "@/lib/types";

type TabModeracion = "portafolio" | "calificaciones";

type AccionModeracion =
  | {
      tipo: "portafolio";
      item: PortafolioModeracion;
      estado: EstadoVisibilidadPortafolioModeracion;
      titulo: string;
      descripcion: string;
      motivoInicial: string;
      motivoObligatorio: boolean;
    }
  | {
      tipo: "calificacion";
      item: CalificacionModeracion;
      estado: EstadoVisibilidadCalificacionModeracion;
      titulo: string;
      descripcion: string;
      motivoInicial: string;
      motivoObligatorio: boolean;
    };

function ModeracionAdmin() {
  const [tab, setTab] = useState<TabModeracion>("portafolio");
  const [portafolios, setPortafolios] = useState<PortafolioModeracion[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionModeracion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [accion, setAccion] = useState<AccionModeracion | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [portafoliosResponse, calificacionesResponse] = await Promise.all([
        listarPortafoliosModeracionAdmin(),
        listarCalificacionesModeracionAdmin()
      ]);
      setPortafolios(portafoliosResponse.datos);
      setCalificaciones(calificacionesResponse.datos);
    } catch {
      setError("No se pudieron cargar los registros de moderación.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirOcultarPortafolio = (item: PortafolioModeracion) => {
    setAccion({
      tipo: "portafolio",
      item,
      estado: "OCULTO",
      titulo: "Ocultar publicación",
      descripcion: "Esta publicación dejará de mostrarse públicamente en el portafolio del barbero.",
      motivoInicial: "",
      motivoObligatorio: true
    });
  };

  const abrirVisiblePortafolio = (item: PortafolioModeracion) => {
    setAccion({
      tipo: "portafolio",
      item,
      estado: "VISIBLE",
      titulo: "Hacer visible publicación",
      descripcion: "La publicación volverá a mostrarse públicamente si el resto de reglas lo permite.",
      motivoInicial: "Publicación revisada y aprobada",
      motivoObligatorio: false
    });
  };

  const abrirOcultarCalificacion = (item: CalificacionModeracion) => {
    setAccion({
      tipo: "calificacion",
      item,
      estado: "OCULTA",
      titulo: "Ocultar calificación",
      descripcion: "Esta calificación dejará de mostrarse públicamente en el perfil del barbero.",
      motivoInicial: "",
      motivoObligatorio: true
    });
  };

  const abrirVisibleCalificacion = (item: CalificacionModeracion) => {
    setAccion({
      tipo: "calificacion",
      item,
      estado: "VISIBLE",
      titulo: "Hacer visible calificación",
      descripcion: "La calificación volverá a mostrarse públicamente.",
      motivoInicial: "Calificación revisada y aprobada",
      motivoObligatorio: false
    });
  };

  const confirmarModeracion = async (motivo: string) => {
    if (!accion) return;

    setGuardando(true);
    setErrorModal("");
    setExito("");

    try {
      if (accion.tipo === "portafolio") {
        const response = await moderarPortafolioAdmin(accion.item.idPortafolioCorte, {
          estadoVisibilidad: accion.estado,
          motivoModeracion: motivo || accion.motivoInicial
        });
        setExito(response.mensaje || "Publicación moderada correctamente.");
      } else {
        const response = await moderarCalificacionAdmin(accion.item.idCalificacion, {
          estadoVisibilidad: accion.estado,
          motivoModeracion: motivo || accion.motivoInicial
        });
        setExito(response.mensaje || "Calificación moderada correctamente.");
      }

      setAccion(null);
      await cargarDatos();
    } catch {
      setErrorModal(
        accion.tipo === "portafolio"
          ? "No se pudo moderar la publicación."
          : "No se pudo moderar la calificación."
      );
    } finally {
      setGuardando(false);
    }
  };

  const registrosActuales = tab === "portafolio" ? portafolios.length : calificaciones.length;

  return (
    <div className="space-y-5">
      <ModeracionTabs activa={tab} onCambiar={setTab} />

      <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">
              {tab === "portafolio" ? "Publicaciones de portafolio" : "Calificaciones"}
            </p>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              {registrosActuales} registros consultados para revisión administrativa.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b5b5b5]">
            Trazabilidad visual de estados
          </p>
        </div>
      </Card>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando moderación..." />
      ) : tab === "portafolio" ? (
        portafolios.length ? (
          <div className="grid gap-4">
            {portafolios.map((portafolio) => (
              <PortafolioModeracionCard
                key={portafolio.idPortafolioCorte}
                onOcultar={abrirOcultarPortafolio}
                onVisible={abrirVisiblePortafolio}
                portafolio={portafolio}
              />
            ))}
          </div>
        ) : (
          <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
            No hay publicaciones de portafolio para moderar.
          </Card>
        )
      ) : calificaciones.length ? (
        <div className="grid gap-4">
          {calificaciones.map((calificacion) => (
            <CalificacionModeracionCard
              calificacion={calificacion}
              key={calificacion.idCalificacion}
              onOcultar={abrirOcultarCalificacion}
              onVisible={abrirVisibleCalificacion}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay calificaciones para moderar.
        </Card>
      )}

      <ModeracionModal
        abierto={Boolean(accion)}
        cargando={guardando}
        descripcion={accion?.descripcion ?? ""}
        error={errorModal}
        motivoInicial={accion?.motivoInicial}
        motivoObligatorio={accion?.motivoObligatorio}
        onCerrar={() => setAccion(null)}
        onConfirmar={confirmarModeracion}
        titulo={accion?.titulo ?? "Moderar"}
      />
    </div>
  );
}

export default function AdministradorModeracionPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Revisa portafolios y calificaciones para mantener la calidad del contenido."
          sidebarItems={adminSidebarItems}
          titulo="Moderación"
          usuario={usuario}
        >
          <ModeracionAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
