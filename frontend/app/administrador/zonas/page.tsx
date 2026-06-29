"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ZonaAdminCard } from "@/components/administrador/catalogos/ZonaAdminCard";
import { ZonaFormModal } from "@/components/administrador/catalogos/ZonaFormModal";
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
  actualizarZonaAdmin,
  crearZonaAdmin,
  desactivarZonaAdmin,
  listarZonasAdmin,
  type ZonaPayload
} from "@/lib/admin-catalogos-api";
import type { ZonaCoberturaAdmin } from "@/lib/types";

function ZonasAdmin() {
  const [zonas, setZonas] = useState<ZonaCoberturaAdmin[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zonaEditar, setZonaEditar] = useState<ZonaCoberturaAdmin | null>(null);
  const [zonaDesactivar, setZonaDesactivar] = useState<ZonaCoberturaAdmin | null>(null);

  const cargarZonas = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const response = await listarZonasAdmin(1, 50);
      setZonas(response.datos);
    } catch {
      setError("No se pudieron cargar las zonas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarZonas();
  }, [cargarZonas]);

  const zonasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return zonas.filter(
      (zona) =>
        !texto ||
        zona.nombre.toLowerCase().includes(texto) ||
        (zona.distrito ?? "").toLowerCase().includes(texto) ||
        (zona.provincia ?? "").toLowerCase().includes(texto) ||
        (zona.departamento ?? "").toLowerCase().includes(texto)
    );
  }, [busqueda, zonas]);

  const guardar = async (data: ZonaPayload) => {
    setGuardando(true);
    setErrorModal("");
    setExito("");
    try {
      const response = zonaEditar
        ? await actualizarZonaAdmin(zonaEditar.idZonaCobertura, data)
        : await crearZonaAdmin(data);
      setExito(response.mensaje);
      setModalAbierto(false);
      setZonaEditar(null);
      await cargarZonas();
    } catch (error) {
      setErrorModal(error instanceof Error ? error.message : "No se pudo guardar la zona.");
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async () => {
    if (!zonaDesactivar) return;
    setGuardando(true);
    setError("");
    setExito("");
    try {
      const response = await desactivarZonaAdmin(zonaDesactivar.idZonaCobertura);
      setExito(response.mensaje);
      setZonaDesactivar(null);
      await cargarZonas();
    } catch {
      setError("No se pudo desactivar la zona.");
    } finally {
      setGuardando(false);
    }
  };

  const buscar = (event: FormEvent) => event.preventDefault();

  return (
    <div className="space-y-5">
      <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
        <form className="grid gap-4 sm:grid-cols-[1fr_auto_auto]" onSubmit={buscar}>
          <Input
            label="Búsqueda"
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Nombre, distrito o provincia"
            value={busqueda}
          />
          <Button className="self-end bg-[#d4af37] text-black hover:bg-[#f5d77b]" type="submit">
            Buscar
          </Button>
          <Button
            className="self-end"
            onClick={() => {
              setZonaEditar(null);
              setModalAbierto(true);
            }}
            type="button"
          >
            Nueva zona
          </Button>
        </form>
      </Card>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando zonas..." />
      ) : zonasFiltradas.length ? (
        <div className="grid gap-4">
          {zonasFiltradas.map((zona) => (
            <ZonaAdminCard
              key={zona.idZonaCobertura}
              onDesactivar={setZonaDesactivar}
              onEditar={(item) => {
                setZonaEditar(item);
                setModalAbierto(true);
              }}
              zona={zona}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay zonas para mostrar.
        </Card>
      )}

      <ZonaFormModal
        abierto={modalAbierto}
        cargando={guardando}
        error={errorModal}
        onCerrar={() => {
          setModalAbierto(false);
          setZonaEditar(null);
        }}
        onGuardar={guardar}
        zona={zonaEditar}
      />
      <ConfirmModal
        abierto={Boolean(zonaDesactivar)}
        cargando={guardando}
        confirmLabel="Sí, desactivar"
        loadingLabel="Desactivando..."
        mensaje="¿Seguro que deseas desactivar esta zona?"
        onCancel={() => setZonaDesactivar(null)}
        onConfirm={desactivar}
        titulo="Desactivar zona"
      />
    </div>
  );
}

export default function AdministradorZonasPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Administra los distritos donde los barberos pueden atender."
          sidebarItems={adminSidebarItems}
          titulo="Zonas de cobertura"
          usuario={usuario}
        >
          <ZonasAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
