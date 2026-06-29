"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CategoriaAdminCard } from "@/components/administrador/catalogos/CategoriaAdminCard";
import { CategoriaFormModal } from "@/components/administrador/catalogos/CategoriaFormModal";
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
  actualizarCategoriaAdmin,
  crearCategoriaAdmin,
  desactivarCategoriaAdmin,
  listarCategoriasAdmin,
  type CategoriaPayload
} from "@/lib/admin-catalogos-api";
import type { CategoriaCorteAdmin } from "@/lib/types";

const activa = (categoria: CategoriaCorteAdmin) => categoria.activa ?? categoria.activo ?? true;

function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<CategoriaCorteAdmin[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaCorteAdmin | null>(null);
  const [categoriaDesactivar, setCategoriaDesactivar] = useState<CategoriaCorteAdmin | null>(null);

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const response = await listarCategoriasAdmin(1, 50);
      setCategorias(response.datos);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return categorias.filter(
      (categoria) =>
        !texto ||
        categoria.nombre.toLowerCase().includes(texto) ||
        (categoria.descripcion ?? "").toLowerCase().includes(texto)
    );
  }, [busqueda, categorias]);

  const guardar = async (data: CategoriaPayload) => {
    setGuardando(true);
    setErrorModal("");
    setExito("");
    try {
      const response = categoriaEditar
        ? await actualizarCategoriaAdmin(categoriaEditar.idCategoriaCorte, data)
        : await crearCategoriaAdmin(data);
      setExito(response.mensaje);
      setModalAbierto(false);
      setCategoriaEditar(null);
      await cargarCategorias();
    } catch (error) {
      setErrorModal(error instanceof Error ? error.message : "No se pudo guardar la categoría.");
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async () => {
    if (!categoriaDesactivar) return;
    setGuardando(true);
    setError("");
    setExito("");
    try {
      const response = await desactivarCategoriaAdmin(categoriaDesactivar.idCategoriaCorte);
      setExito(response.mensaje);
      setCategoriaDesactivar(null);
      await cargarCategorias();
    } catch {
      setError("No se pudo desactivar la categoría.");
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
            placeholder="Nombre o descripción"
            value={busqueda}
          />
          <Button className="self-end bg-[#d4af37] text-black hover:bg-[#f5d77b]" type="submit">
            Buscar
          </Button>
          <Button
            className="self-end"
            onClick={() => {
              setCategoriaEditar(null);
              setModalAbierto(true);
            }}
            type="button"
          >
            Nueva categoría
          </Button>
        </form>
      </Card>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando categorías..." />
      ) : categoriasFiltradas.length ? (
        <div className="grid gap-4">
          {categoriasFiltradas.map((categoria) => (
            <CategoriaAdminCard
              categoria={categoria}
              key={categoria.idCategoriaCorte}
              onDesactivar={(item) => {
                if (activa(item)) setCategoriaDesactivar(item);
              }}
              onEditar={(item) => {
                setCategoriaEditar(item);
                setModalAbierto(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay categorías para mostrar.
        </Card>
      )}

      <CategoriaFormModal
        abierto={modalAbierto}
        cargando={guardando}
        categoria={categoriaEditar}
        error={errorModal}
        onCerrar={() => {
          setModalAbierto(false);
          setCategoriaEditar(null);
        }}
        onGuardar={guardar}
      />
      <ConfirmModal
        abierto={Boolean(categoriaDesactivar)}
        cargando={guardando}
        confirmLabel="Sí, desactivar"
        loadingLabel="Desactivando..."
        mensaje="¿Seguro que deseas desactivar esta categoría?"
        onCancel={() => setCategoriaDesactivar(null)}
        onConfirm={desactivar}
        titulo="Desactivar categoría"
      />
    </div>
  );
}

export default function AdministradorCategoriasPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Administra las categorías usadas en portafolios y LookIA."
          sidebarItems={adminSidebarItems}
          titulo="Categorías de cortes"
          usuario={usuario}
        >
          <CategoriasAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
