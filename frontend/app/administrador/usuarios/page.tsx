"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CambiarEstadoUsuarioModal } from "@/components/administrador/usuarios/CambiarEstadoUsuarioModal";
import { UsuarioCard } from "@/components/administrador/usuarios/UsuarioCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { adminSidebarItems } from "@/lib/admin-navigation";
import { cambiarEstadoUsuarioAdmin, listarUsuariosAdmin } from "@/lib/admin-api";
import type { Paginacion, RolUsuario, UsuarioAdmin, UsuarioSesion } from "@/lib/types";

type FiltrosUsuarios = {
  busqueda: string;
  rol: RolUsuario | "";
  estado: string;
};

const filtrosIniciales: FiltrosUsuarios = {
  busqueda: "",
  rol: "",
  estado: ""
};

function UsuariosAdmin({ usuarioSesion }: { usuarioSesion: UsuarioSesion }) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [filtros, setFiltros] = useState<FiltrosUsuarios>(filtrosIniciales);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioAdmin | null>(null);
  const [errorModal, setErrorModal] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const response = await listarUsuariosAdmin({ ...filtros, pagina, limite: 10 });
      setUsuarios(response.datos);
      setPaginacion(response.paginacion ?? null);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, [filtros, pagina]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const buscar = (event: FormEvent) => {
    event.preventDefault();
    setPagina(1);
    cargarUsuarios();
  };

  const limpiar = () => {
    setFiltros(filtrosIniciales);
    setPagina(1);
  };

  const confirmarCambioEstado = async (estadoCuenta: string, motivo: string) => {
    if (!usuarioSeleccionado) return;

    setGuardando(true);
    setErrorModal("");
    setExito("");

    try {
      const response = await cambiarEstadoUsuarioAdmin(
        usuarioSeleccionado.idUsuario,
        estadoCuenta,
        motivo
      );
      setExito(response.mensaje || "Estado de usuario actualizado correctamente.");
      setUsuarioSeleccionado(null);
      await cargarUsuarios();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "No se pudo cambiar el estado del usuario.";
      setErrorModal(mensaje || "No se pudo cambiar el estado del usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
        <form className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto_auto]" onSubmit={buscar}>
          <Input
            label="Búsqueda"
            name="busqueda"
            onChange={(event) => setFiltros((actual) => ({ ...actual, busqueda: event.target.value }))}
            placeholder="Nombre, correo o teléfono"
            value={filtros.busqueda}
          />
          <label className="block text-sm font-medium text-neutral-200">
            Rol
            <select
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              onChange={(event) =>
                setFiltros((actual) => ({ ...actual, rol: event.target.value as RolUsuario | "" }))
              }
              value={filtros.rol}
            >
              <option value="">Todos</option>
              <option value="CLIENTE">CLIENTE</option>
              <option value="BARBERO">BARBERO</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-200">
            Estado
            <select
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              onChange={(event) => setFiltros((actual) => ({ ...actual, estado: event.target.value }))}
              value={filtros.estado}
            >
              <option value="">Todos</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="SUSPENDIDO">SUSPENDIDO</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>
          </label>
          <Button className="self-end bg-[#d4af37] text-black hover:bg-[#f5d77b]" type="submit">
            Buscar
          </Button>
          <Button className="self-end" onClick={limpiar} type="button" variant="secondary">
            Limpiar
          </Button>
        </form>
      </Card>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      {cargando ? (
        <Loading texto="Cargando usuarios..." />
      ) : usuarios.length ? (
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <UsuarioCard
              key={usuario.idUsuario}
              onCambiarEstado={setUsuarioSeleccionado}
              puedeCambiarEstado={usuario.idUsuario !== usuarioSesion.idUsuario}
              usuario={usuario}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay usuarios para los filtros seleccionados.
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
        abierto={Boolean(usuarioSeleccionado)}
        cargando={guardando}
        error={errorModal}
        onCerrar={() => setUsuarioSeleccionado(null)}
        onConfirmar={confirmarCambioEstado}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
}

export default function AdministradorUsuariosPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Administra las cuentas registradas en la plataforma."
          sidebarItems={adminSidebarItems}
          titulo="Usuarios"
          usuario={usuario}
        >
          <UsuariosAdmin usuarioSesion={usuario} />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
