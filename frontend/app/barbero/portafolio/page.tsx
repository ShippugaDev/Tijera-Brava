"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EditarPortafolioModal } from "@/components/barbero/portafolio/EditarPortafolioModal";
import { PortafolioCard } from "@/components/barbero/portafolio/PortafolioCard";
import { PortafolioForm } from "@/components/barbero/portafolio/PortafolioForm";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import {
  actualizarPortafolio,
  crearPortafolio,
  eliminarPortafolio,
  listarCategoriasCortes,
  listarMiPortafolio,
  type PortafolioPayload
} from "@/lib/barbero-portafolio-api";
import type { CategoriaCorte, PortafolioCorte, UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones"
];

const validarPayload = (payload: PortafolioPayload, imagenObligatoria: boolean) => {
  if (!payload.titulo) return "Ingresa un título.";
  if (!payload.descripcion) return "Ingresa una descripción.";
  if (imagenObligatoria && !payload.imagen) return "Selecciona una imagen para el portafolio.";
  if (!payload.idCategoriaCorte) return "Selecciona una categoría.";
  return "";
};

export default function BarberoPortafolioPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <PortafolioContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function PortafolioContent({ usuario }: { usuario: UsuarioSesion }) {
  const [portafolio, setPortafolio] = useState<PortafolioCorte[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCorte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [publicacionAEditar, setPublicacionAEditar] = useState<PortafolioCorte | null>(null);
  const [publicacionAEliminar, setPublicacionAEliminar] = useState<PortafolioCorte | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [portafolioResponse, categoriasResponse] = await Promise.all([
        listarMiPortafolio({ pagina: 1, limite: 50 }),
        listarCategoriasCortes({ pagina: 1, limite: 100 })
      ]);
      setPortafolio(portafolioResponse.datos ?? []);
      setCategorias(categoriasResponse.datos ?? []);
    } catch {
      setPortafolio([]);
      setCategorias([]);
      setError("No se pudo cargar tu portafolio.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const categoriasActivas = useMemo(
    () => categorias.filter((categoria) => categoria.activa !== false && categoria.activo !== false),
    [categorias]
  );

  const publicacionesVisibles = useMemo(
    () => portafolio.filter((publicacion) => publicacion.estadoVisibilidad !== "ELIMINADO"),
    [portafolio]
  );

  const publicar = async (payload: PortafolioPayload) => {
    setError("");
    setExito("");
    const validacion = validarPayload(payload, true);
    if (validacion) {
      setError(validacion);
      return;
    }
    setGuardando(true);
    try {
      const response = await crearPortafolio(payload);
      setExito(response.mensaje ?? "Publicación creada correctamente.");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar el trabajo.");
    } finally {
      setGuardando(false);
    }
  };

  const actualizar = async (payload: PortafolioPayload) => {
    if (!publicacionAEditar) return;
    setError("");
    setExito("");
    const validacion = validarPayload(payload, false);
    if (validacion) {
      setError(validacion);
      return;
    }
    setProcesando(true);
    try {
      const response = await actualizarPortafolio(publicacionAEditar.idPortafolioCorte, payload);
      setExito(response.mensaje ?? "Publicación actualizada correctamente.");
      setPublicacionAEditar(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la publicación.");
    } finally {
      setProcesando(false);
    }
  };

  const eliminar = async () => {
    if (!publicacionAEliminar) return;
    setError("");
    setExito("");
    setProcesando(true);
    try {
      const response = await eliminarPortafolio(publicacionAEliminar.idPortafolioCorte);
      setExito(response.mensaje ?? "Publicación eliminada correctamente.");
      setPublicacionAEliminar(null);
      await cargar();
    } catch {
      setError("No se pudo eliminar la publicación.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Publica y administra tus mejores trabajos con imágenes reales."
      sidebarItems={sidebarItems}
      titulo="Mi portafolio"
      usuario={usuario}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Publicaciones activas</p>
          <p className="mt-2 text-3xl font-black text-white">{publicacionesVisibles.length}</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Destacadas</p>
          <p className="mt-2 text-3xl font-black text-white">
            {publicacionesVisibles.filter((item) => item.destacado).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Categorías</p>
          <p className="mt-2 text-3xl font-black text-white">{categoriasActivas.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando portafolio..." /> : null}

      {!cargando ? (
        <div className="mt-5 grid gap-8">
          <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
            <h2 className="text-xl font-black text-white">Publicar nuevo trabajo</h2>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              Sube una imagen real del trabajo realizado.
            </p>
            <div className="mt-5">
              <PortafolioForm
                categorias={categoriasActivas}
                cargando={guardando}
                submitLabel="Publicar trabajo"
                onSubmit={publicar}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">Mi portafolio</h2>
            {publicacionesVisibles.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
                Aún no tienes trabajos publicados. Agrega tu primer corte al portafolio.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {publicacionesVisibles.map((publicacion) => (
                  <PortafolioCard
                    key={publicacion.idPortafolioCorte}
                    publicacion={publicacion}
                    onEditar={setPublicacionAEditar}
                    onEliminar={setPublicacionAEliminar}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <EditarPortafolioModal
        abierto={Boolean(publicacionAEditar)}
        categorias={categoriasActivas}
        cargando={procesando}
        publicacion={publicacionAEditar}
        onCancel={() => setPublicacionAEditar(null)}
        onSubmit={actualizar}
      />

      <ConfirmModal
        abierto={Boolean(publicacionAEliminar)}
        cargando={procesando}
        confirmLabel="Sí, eliminar"
        loadingLabel="Eliminando..."
        mensaje="¿Seguro que deseas eliminar esta publicación de tu portafolio?"
        onCancel={() => setPublicacionAEliminar(null)}
        onConfirm={eliminar}
        titulo="Eliminar publicación"
      />
    </RoleLayout>
  );
}
