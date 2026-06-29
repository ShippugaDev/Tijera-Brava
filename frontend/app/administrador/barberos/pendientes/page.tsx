"use client";

import { useCallback, useEffect, useState } from "react";
import { BarberoPendienteCard } from "@/components/administrador/barberos/BarberoPendienteCard";
import { RechazarBarberoModal } from "@/components/administrador/barberos/RechazarBarberoModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { adminSidebarItems } from "@/lib/admin-navigation";
import {
  aprobarBarberoAdmin,
  listarBarberosPendientesAdmin,
  rechazarBarberoAdmin
} from "@/lib/admin-api";
import type { BarberoPendienteAdmin, Paginacion } from "@/lib/types";

function BarberosPendientesAdmin() {
  const [barberos, setBarberos] = useState<BarberoPendienteAdmin[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [barberoAprobar, setBarberoAprobar] = useState<BarberoPendienteAdmin | null>(null);
  const [barberoRechazar, setBarberoRechazar] = useState<BarberoPendienteAdmin | null>(null);
  const [errorModal, setErrorModal] = useState("");

  const cargarPendientes = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const response = await listarBarberosPendientesAdmin({ busqueda, pagina, limite: 10 });
      setBarberos(response.datos);
      setPaginacion(response.paginacion ?? null);
    } catch {
      setError("No se pudieron cargar las solicitudes pendientes.");
    } finally {
      setCargando(false);
    }
  }, [busqueda, pagina]);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const aprobar = async () => {
    if (!barberoAprobar) return;

    setGuardando(true);
    setError("");
    setExito("");

    try {
      const response = await aprobarBarberoAdmin(barberoAprobar.idBarbero);
      setExito(response.mensaje || "Barbero aprobado correctamente.");
      setBarberoAprobar(null);
      await cargarPendientes();
    } catch {
      setError("No se pudo aprobar el barbero.");
    } finally {
      setGuardando(false);
    }
  };

  const rechazar = async (motivo: string) => {
    if (!barberoRechazar) return;

    setGuardando(true);
    setErrorModal("");
    setExito("");

    try {
      const response = await rechazarBarberoAdmin(barberoRechazar.idBarbero, motivo);
      setExito(response.mensaje || "Barbero rechazado correctamente.");
      setBarberoRechazar(null);
      await cargarPendientes();
    } catch {
      setErrorModal("No se pudo rechazar el barbero.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
        <form
          className="grid gap-4 sm:grid-cols-[1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPagina(1);
            cargarPendientes();
          }}
        >
          <Input
            label="Búsqueda"
            name="busqueda"
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Nombre, correo o nombre profesional"
            value={busqueda}
          />
          <Button className="self-end bg-[#d4af37] text-black hover:bg-[#f5d77b]" type="submit">
            Buscar
          </Button>
          <Button
            className="self-end"
            onClick={() => {
              setBusqueda("");
              setPagina(1);
            }}
            type="button"
            variant="secondary"
          >
            Limpiar
          </Button>
        </form>
      </Card>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando solicitudes..." />
      ) : barberos.length ? (
        <div className="space-y-4">
          {barberos.map((barbero) => (
            <BarberoPendienteCard
              barbero={barbero}
              key={barbero.idBarbero}
              onAprobar={setBarberoAprobar}
              onRechazar={setBarberoRechazar}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay solicitudes pendientes.
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

      <ConfirmModal
        abierto={Boolean(barberoAprobar)}
        cargando={guardando}
        confirmLabel="Sí, aprobar"
        loadingLabel="Aprobando..."
        mensaje="¿Deseas aprobar a este barbero para que pueda ofrecer servicios?"
        onCancel={() => setBarberoAprobar(null)}
        onConfirm={aprobar}
        titulo="Aprobar barbero"
      />
      <RechazarBarberoModal
        abierto={Boolean(barberoRechazar)}
        barbero={barberoRechazar}
        cargando={guardando}
        error={errorModal}
        onCerrar={() => setBarberoRechazar(null)}
        onConfirmar={rechazar}
      />
    </div>
  );
}

export default function AdministradorBarberosPendientesPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Revisa solicitudes de profesionales antes de activarlos en la plataforma."
          sidebarItems={adminSidebarItems}
          titulo="Barberos pendientes"
          usuario={usuario}
        >
          <BarberosPendientesAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
