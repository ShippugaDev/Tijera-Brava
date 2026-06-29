"use client";

import { useCallback, useEffect, useState } from "react";
import { BarberoAdminCard } from "@/components/administrador/barberos/BarberoAdminCard";
import { CambiarEstadoUsuarioModal } from "@/components/administrador/usuarios/CambiarEstadoUsuarioModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { adminSidebarItems } from "@/lib/admin-navigation";
import { cambiarEstadoUsuarioAdmin, listarUsuariosAdmin, obtenerUsuarioAdmin } from "@/lib/admin-api";
import type { Paginacion, UsuarioAdmin } from "@/lib/types";

function BarberosAdmin() {
  const [barberos, setBarberos] = useState<UsuarioAdmin[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<UsuarioAdmin | null>(null);
  const [errorModal, setErrorModal] = useState("");

  const cargarBarberos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const response = await listarUsuariosAdmin({ rol: "BARBERO", pagina, limite: 10 });
      const detalles = await Promise.all(
        response.datos.map(async (usuario) => {
          try {
            const detalle = await obtenerUsuarioAdmin(usuario.idUsuario);
            return detalle.datos.usuario;
          } catch {
            return usuario;
          }
        })
      );
      setBarberos(detalles);
      setPaginacion(response.paginacion ?? null);
    } catch {
      setError("No se pudieron cargar los barberos.");
    } finally {
      setCargando(false);
    }
  }, [pagina]);

  useEffect(() => {
    cargarBarberos();
  }, [cargarBarberos]);

  const confirmarCambioEstado = async (estadoCuenta: string, motivo: string) => {
    if (!barberoSeleccionado) return;

    setGuardando(true);
    setErrorModal("");
    setExito("");

    try {
      const response = await cambiarEstadoUsuarioAdmin(
        barberoSeleccionado.idUsuario,
        estadoCuenta,
        motivo
      );
      setExito(response.mensaje || "Estado del barbero actualizado correctamente.");
      setBarberoSeleccionado(null);
      await cargarBarberos();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "No se pudo cambiar el estado del barbero.";
      setErrorModal(mensaje || "No se pudo cambiar el estado del barbero.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5">
      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando barberos..." />
      ) : barberos.length ? (
        <div className="space-y-4">
          {barberos.map((usuario) => (
            <BarberoAdminCard
              key={usuario.idUsuario}
              onCambiarEstado={setBarberoSeleccionado}
              usuario={usuario}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay barberos registrados.
        </Card>
      )}

      {paginacion ? (
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0d0d0d] p-4 text-sm text-[#b5b5b5] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Página {paginacion.pagina} de {Math.max(paginacion.totalPaginas, 1)} ·{" "}
            {paginacion.totalRegistros} registros
          </span>
          <div className="flex gap-3">
            <Button
              disabled={!paginacion.tieneAnterior}
              onClick={() => setPagina((actual) => Math.max(actual - 1, 1))}
              type="button"
              variant="secondary"
            >
              Anterior
            </Button>
            <Button
              disabled={!paginacion.tieneSiguiente}
              onClick={() => setPagina((actual) => actual + 1)}
              type="button"
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <CambiarEstadoUsuarioModal
        abierto={Boolean(barberoSeleccionado)}
        cargando={guardando}
        cancelLabel="Cancelar"
        error={errorModal}
        nombreEntidad={barberoSeleccionado?.barbero?.nombreProfesional || undefined}
        onCerrar={() => setBarberoSeleccionado(null)}
        onConfirmar={confirmarCambioEstado}
        textoDescripcion="Cambia el estado de cuenta del barbero. El estado APROBADO pertenece a la aprobación profesional y no se modifica desde este modal."
        titulo="Cambiar estado del barbero"
        usuario={barberoSeleccionado}
      />
    </div>
  );
}

export default function AdministradorBarberosPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Revisa los perfiles profesionales registrados y gestiona su estado."
          sidebarItems={adminSidebarItems}
          titulo="Barberos"
          usuario={usuario}
        >
          <BarberosAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
