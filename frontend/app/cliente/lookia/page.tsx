"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SimulacionLookIACard } from "@/components/cliente/lookia/SimulacionLookIACard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { eliminarSimulacionLookIA, listarSimulacionesLookIA } from "@/lib/lookia-api";
import type { SimulacionLookIA, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];
const estados = ["", "PROCESANDO", "COMPLETADA", "FALLIDA", "ELIMINADA"];

export default function ClienteLookIAPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <LookIAContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function LookIAContent({ usuario }: { usuario: UsuarioSesion }) {
  const [simulaciones, setSimulaciones] = useState<SimulacionLookIA[]>([]);
  const [estadoSimulacion, setEstadoSimulacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [simulacionAEliminar, setSimulacionAEliminar] = useState<string | null>(null);

  const cargar = async (estado = estadoSimulacion) => {
    setCargando(true);
    setError("");
    try {
      const response = await listarSimulacionesLookIA({
        estadoSimulacion: estado,
        pagina: 1,
        limite: 12
      });
      setSimulaciones(response.datos ?? []);
    } catch {
      setSimulaciones([]);
      setError("No se pudieron cargar tus simulaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarEstado = (value: string) => {
    setEstadoSimulacion(value);
    cargar(value);
  };

  const eliminar = async () => {
    if (!simulacionAEliminar) return;
    setError("");
    setExito("");
    setEliminando(true);
    try {
      await eliminarSimulacionLookIA(simulacionAEliminar);
      setExito("Simulación eliminada correctamente.");
      setSimulacionAEliminar(null);
      await cargar();
    } catch {
      setError("No se pudo eliminar la simulación.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Prueba estilos antes de reservar tu próximo corte."
      sidebarItems={sidebarItems}
      titulo="LookIA"
      usuario={usuario}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#b5b5b5]">
          Explora tus simulaciones y encuentra el barbero ideal para el resultado.
        </p>
        <Link
          className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-center text-sm font-black text-black hover:bg-[#f5d77b]"
          href="/cliente/lookia/nueva"
        >
          Nueva simulación
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
        <label className="block max-w-xs text-sm font-medium text-neutral-200">
          Estado
          <select
            className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
            value={estadoSimulacion}
            onChange={(event) => cambiarEstado(event.target.value)}
          >
            {estados.map((estado) => (
              <option key={estado || "todos"} value={estado}>
                {estado || "Todos"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando simulaciones LookIA..." /> : null}

      {!cargando && simulaciones.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          Aún no tienes simulaciones. Crea tu primera prueba de estilo con LookIA.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {simulaciones.map((simulacion) => (
          <SimulacionLookIACard
            key={simulacion.idSimulacionLookIA}
            onEliminar={setSimulacionAEliminar}
            simulacion={simulacion}
          />
        ))}
      </div>

      <ConfirmModal
        abierto={Boolean(simulacionAEliminar)}
        cargando={eliminando}
        confirmLabel="Sí, eliminar"
        loadingLabel="Eliminando..."
        mensaje="¿Seguro que deseas eliminar esta simulación? Esta acción cambiará su estado y no se usará para recomendaciones."
        onCancel={() => setSimulacionAEliminar(null)}
        onConfirm={eliminar}
        titulo="Eliminar simulación"
      />
    </RoleLayout>
  );
}
