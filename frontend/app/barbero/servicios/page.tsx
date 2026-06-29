"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AsignarServicioModal } from "@/components/barbero/servicios/AsignarServicioModal";
import { EditarServicioModal } from "@/components/barbero/servicios/EditarServicioModal";
import { ServicioBarberoCard } from "@/components/barbero/servicios/ServicioBarberoCard";
import { ServicioCatalogoCard } from "@/components/barbero/servicios/ServicioCatalogoCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import {
  actualizarServicioBarbero,
  asignarServicioBarbero,
  listarCatalogoServicios,
  listarMisServiciosBarbero,
  retirarServicioBarbero
} from "@/lib/barbero-servicios-api";
import type { ServicioBarberoAsignado, ServicioCatalogo, UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones"
];

const validarPayload = (payload: { precioPersonalizado: number; duracionPersonalizada: number }) => {
  if (!Number.isFinite(payload.precioPersonalizado) || payload.precioPersonalizado <= 0) {
    return "El precio debe ser mayor que 0.";
  }
  if (!Number.isInteger(payload.duracionPersonalizada) || payload.duracionPersonalizada <= 0) {
    return "La duración debe ser mayor que 0.";
  }
  return "";
};

const mensajeErrorServicio = (mensajeBase: string, error: unknown) => {
  const mensaje = error instanceof Error ? error.message.toLowerCase() : "";
  if (mensaje.includes("ya está asignado")) {
    return "Este servicio ya está asignado a tu perfil.";
  }
  return mensajeBase;
};

const esServicioAsignadoActivo = (servicio: ServicioBarberoAsignado) => {
  const estado = (servicio.estado ?? servicio.estadoAsignacion ?? "").toUpperCase();
  return servicio.activo !== false && servicio.estaActivo !== false && estado !== "INACTIVO" && estado !== "ELIMINADO";
};

export default function BarberoServiciosPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <ServiciosContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function ServiciosContent({ usuario }: { usuario: UsuarioSesion }) {
  const [asignados, setAsignados] = useState<ServicioBarberoAsignado[]>([]);
  const [catalogo, setCatalogo] = useState<ServicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [servicioAAsignar, setServicioAAsignar] = useState<ServicioCatalogo | null>(null);
  const [servicioAEditar, setServicioAEditar] = useState<ServicioBarberoAsignado | null>(null);
  const [servicioARetirar, setServicioARetirar] = useState<ServicioBarberoAsignado | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [asignadosResponse, catalogoResponse] = await Promise.all([
        listarMisServiciosBarbero(),
        listarCatalogoServicios({ pagina: 1, limite: 100 })
      ]);
      setAsignados(asignadosResponse.datos ?? []);
      setCatalogo(catalogoResponse.datos ?? []);
    } catch {
      setAsignados([]);
      setCatalogo([]);
      setError("No se pudieron cargar tus servicios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const serviciosActivos = useMemo(
    () => asignados.filter(esServicioAsignadoActivo),
    [asignados]
  );

  const serviciosInactivos = useMemo(
    () => asignados.filter((servicio) => !esServicioAsignadoActivo(servicio)),
    [asignados]
  );

  const idsAsignados = useMemo(
    () => new Set(serviciosActivos.map((item) => item.idServicio)),
    [serviciosActivos]
  );

  const asignar = async (payload: { precioPersonalizado: number; duracionPersonalizada: number }) => {
    if (!servicioAAsignar) return;
    setError("");
    setExito("");
    const validacion = validarPayload(payload);
    if (validacion) {
      setError(validacion);
      return;
    }
    setProcesando(true);
    try {
      const response = await asignarServicioBarbero({
        idServicio: servicioAAsignar.idServicio,
        ...payload
      });
      setExito(response.mensaje ?? "Servicio asignado correctamente.");
      setServicioAAsignar(null);
      await cargar();
    } catch (err) {
      setError(mensajeErrorServicio("No se pudo asignar el servicio.", err));
    } finally {
      setProcesando(false);
    }
  };

  const editar = async (payload: { precioPersonalizado: number; duracionPersonalizada: number }) => {
    if (!servicioAEditar) return;
    setError("");
    setExito("");
    const validacion = validarPayload(payload);
    if (validacion) {
      setError(validacion);
      return;
    }
    setProcesando(true);
    try {
      await actualizarServicioBarbero(servicioAEditar.idServicioBarbero, payload);
      setExito("Servicio actualizado correctamente.");
      setServicioAEditar(null);
      await cargar();
    } catch (err) {
      setError(mensajeErrorServicio("No se pudo actualizar el servicio.", err));
    } finally {
      setProcesando(false);
    }
  };

  const retirar = async () => {
    if (!servicioARetirar) return;
    setError("");
    setExito("");
    setProcesando(true);
    try {
      await retirarServicioBarbero(servicioARetirar.idServicioBarbero);
      setExito("Servicio retirado correctamente.");
      setServicioARetirar(null);
      await cargar();
    } catch {
      setError("No se pudo retirar el servicio.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Gestiona los cortes y precios que ofreces a domicilio."
      sidebarItems={sidebarItems}
      titulo="Mis servicios"
      usuario={usuario}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Servicios asignados</p>
          <p className="mt-2 text-3xl font-black text-white">{serviciosActivos.length}</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Catálogo disponible</p>
          <p className="mt-2 text-3xl font-black text-white">{catalogo.length}</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Gestión</p>
          <p className="mt-2 text-lg font-black text-[#f5d77b]">Precios personalizados</p>
        </div>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando servicios..." /> : null}

      {!cargando ? (
        <div className="mt-5 grid gap-8">
          <section>
            <h2 className="text-xl font-black text-white">Mis servicios ofrecidos</h2>
            {serviciosActivos.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
                Aún no tienes servicios asignados.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {serviciosActivos.map((servicio) => (
                  <ServicioBarberoCard
                    key={servicio.idServicioBarbero}
                    servicio={servicio}
                    onEditar={setServicioAEditar}
                    onRetirar={setServicioARetirar}
                  />
                ))}
              </div>
            )}
            {serviciosInactivos.length > 0 ? (
              <p className="mt-3 text-sm text-[#b5b5b5]">
                {serviciosInactivos.length} servicio(s) retirado(s) oculto(s) de esta lista.
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-xl font-black text-white">Catálogo de servicios</h2>
            {catalogo.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
                No hay servicios disponibles en el catálogo.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {catalogo.map((servicio) => (
                  <ServicioCatalogoCard
                    asignado={idsAsignados.has(servicio.idServicio)}
                    key={servicio.idServicio}
                    servicio={servicio}
                    onAsignar={setServicioAAsignar}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <AsignarServicioModal
        abierto={Boolean(servicioAAsignar)}
        cargando={procesando}
        servicio={servicioAAsignar}
        onCancel={() => setServicioAAsignar(null)}
        onSubmit={asignar}
      />

      <EditarServicioModal
        abierto={Boolean(servicioAEditar)}
        cargando={procesando}
        servicio={servicioAEditar}
        onCancel={() => setServicioAEditar(null)}
        onSubmit={editar}
      />

      <ConfirmModal
        abierto={Boolean(servicioARetirar)}
        cargando={procesando}
        confirmLabel="Sí, retirar"
        loadingLabel="Retirando..."
        mensaje="¿Seguro que deseas retirar este servicio de tu perfil?"
        onCancel={() => setServicioARetirar(null)}
        onConfirm={retirar}
        titulo="Retirar servicio"
      />
    </RoleLayout>
  );
}
