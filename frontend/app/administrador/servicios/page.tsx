"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ServicioAdminCard } from "@/components/administrador/catalogos/ServicioAdminCard";
import { ServicioFormModal } from "@/components/administrador/catalogos/ServicioFormModal";
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
  actualizarServicioAdmin,
  crearServicioAdmin,
  desactivarServicioAdmin,
  listarServiciosAdmin,
  type ServicioPayload
} from "@/lib/admin-catalogos-api";
import type { ServicioAdmin } from "@/lib/types";

function ServiciosAdmin() {
  const [servicios, setServicios] = useState<ServicioAdmin[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditar, setServicioEditar] = useState<ServicioAdmin | null>(null);
  const [servicioDesactivar, setServicioDesactivar] = useState<ServicioAdmin | null>(null);

  const cargarServicios = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const response = await listarServiciosAdmin(1, 50);
      setServicios(response.datos);
    } catch {
      setError("No se pudieron cargar los servicios.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

  const serviciosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return servicios.filter((servicio) => {
      const coincideTexto =
        !texto ||
        servicio.nombre.toLowerCase().includes(texto) ||
        (servicio.descripcion ?? "").toLowerCase().includes(texto);
      const activo = servicio.activo !== false;
      const coincideEstado =
        !estado || (estado === "ACTIVO" && activo) || (estado === "INACTIVO" && !activo);
      return coincideTexto && coincideEstado;
    });
  }, [busqueda, estado, servicios]);

  const guardar = async (data: ServicioPayload) => {
    setGuardando(true);
    setErrorModal("");
    setExito("");
    try {
      const response = servicioEditar
        ? await actualizarServicioAdmin(servicioEditar.idServicio, data)
        : await crearServicioAdmin(data);
      setExito(response.mensaje);
      setModalAbierto(false);
      setServicioEditar(null);
      await cargarServicios();
    } catch (error) {
      setErrorModal(error instanceof Error ? error.message : "No se pudo guardar el servicio.");
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async () => {
    if (!servicioDesactivar) return;
    setGuardando(true);
    setError("");
    setExito("");
    try {
      const response = await desactivarServicioAdmin(servicioDesactivar.idServicio);
      setExito(response.mensaje);
      setServicioDesactivar(null);
      await cargarServicios();
    } catch {
      setError("No se pudo desactivar el servicio.");
    } finally {
      setGuardando(false);
    }
  };

  const buscar = (event: FormEvent) => event.preventDefault();

  return (
    <div className="space-y-5">
      <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
        <form className="grid gap-4 lg:grid-cols-[1fr_180px_auto_auto]" onSubmit={buscar}>
          <Input
            label="Búsqueda"
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Nombre o descripción"
            value={busqueda}
          />
          <label className="block text-sm font-medium text-neutral-200">
            Estado
            <select
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              onChange={(event) => setEstado(event.target.value)}
              value={estado}
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </label>
          <Button className="self-end bg-[#d4af37] text-black hover:bg-[#f5d77b]" type="submit">
            Buscar
          </Button>
          <Button
            className="self-end"
            onClick={() => {
              setBusqueda("");
              setEstado("");
              setServicioEditar(null);
              setModalAbierto(true);
            }}
            type="button"
          >
            Nuevo servicio
          </Button>
        </form>
      </Card>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando servicios..." />
      ) : serviciosFiltrados.length ? (
        <div className="grid gap-4">
          {serviciosFiltrados.map((servicio) => (
            <ServicioAdminCard
              key={servicio.idServicio}
              onDesactivar={setServicioDesactivar}
              onEditar={(item) => {
                setServicioEditar(item);
                setModalAbierto(true);
              }}
              servicio={servicio}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay servicios para mostrar.
        </Card>
      )}

      <ServicioFormModal
        abierto={modalAbierto}
        cargando={guardando}
        error={errorModal}
        onCerrar={() => {
          setModalAbierto(false);
          setServicioEditar(null);
        }}
        onGuardar={guardar}
        servicio={servicioEditar}
      />
      <ConfirmModal
        abierto={Boolean(servicioDesactivar)}
        cargando={guardando}
        confirmLabel="Sí, desactivar"
        loadingLabel="Desactivando..."
        mensaje="¿Seguro que deseas desactivar este servicio?"
        onCancel={() => setServicioDesactivar(null)}
        onConfirm={desactivar}
        titulo="Desactivar servicio"
      />
    </div>
  );
}

export default function AdministradorServiciosPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Administra los servicios disponibles para los barberos."
          sidebarItems={adminSidebarItems}
          titulo="Servicios"
          usuario={usuario}
        >
          <ServiciosAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
