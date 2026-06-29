"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BarberoRecomendadoCard } from "@/components/cliente/lookia/BarberoRecomendadoCard";
import { LookIAResultPanel } from "@/components/cliente/lookia/LookIAResultPanel";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import {
  eliminarSimulacionLookIA,
  listarBarberosRecomendadosLookIA,
  obtenerSimulacionLookIA,
  regenerarSimulacionLookIA
} from "@/lib/lookia-api";
import type { BarberoRecomendado, SimulacionLookIA, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

export default function DetalleSimulacionLookIAPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <DetalleSimulacionContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function DetalleSimulacionContent({ usuario }: { usuario: UsuarioSesion }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idSimulacionLookIA = params.id;
  const [simulacion, setSimulacion] = useState<SimulacionLookIA | null>(null);
  const [barberos, setBarberos] = useState<BarberoRecomendado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoBarberos, setCargandoBarberos] = useState(false);
  const [modal, setModal] = useState<"regenerar" | "eliminar" | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargarDetalle = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await obtenerSimulacionLookIA(idSimulacionLookIA);
      setSimulacion(response.datos.simulacion);
    } catch {
      setError("No se pudo cargar la simulación.");
    } finally {
      setCargando(false);
    }
  };

  const cargarBarberos = async () => {
    setCargandoBarberos(true);
    setError("");
    try {
      const response = await listarBarberosRecomendadosLookIA(idSimulacionLookIA);
      setBarberos(response.datos.barberos ?? []);
    } catch {
      setBarberos([]);
      setError("No se pudieron cargar barberos recomendados.");
    } finally {
      setCargandoBarberos(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
    cargarBarberos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSimulacionLookIA]);

  const regenerar = async () => {
    setError("");
    setExito("");
    setProcesando(true);
    try {
      const response = await regenerarSimulacionLookIA(idSimulacionLookIA);
      setSimulacion(response.datos.simulacion);
      setExito("Simulación regenerada correctamente.");
      setModal(null);
      await cargarBarberos();
    } catch {
      setError("No se pudo regenerar la simulación.");
    } finally {
      setProcesando(false);
    }
  };

  const eliminar = async () => {
    setError("");
    setExito("");
    setProcesando(true);
    try {
      await eliminarSimulacionLookIA(idSimulacionLookIA);
      setModal(null);
      router.push("/cliente/lookia");
    } catch {
      setError("No se pudo eliminar la simulación.");
    } finally {
      setProcesando(false);
    }
  };

  const puedeModificar = simulacion?.estadoSimulacion !== "ELIMINADA";

  return (
    <RoleLayout
      descripcion="Revisa el resultado, regenera la prueba y encuentra barberos recomendados."
      sidebarItems={sidebarItems}
      titulo="Detalle LookIA"
      usuario={usuario}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-sm font-black text-[#f5d77b] hover:text-white" href="/cliente/lookia">
          Volver a LookIA
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!puedeModificar || cargando}
            onClick={() => setModal("regenerar")}
            type="button"
          >
            Regenerar simulación
          </button>
          <button
            className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!puedeModificar || cargando}
            onClick={() => setModal("eliminar")}
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando detalle LookIA..." /> : null}
      {!cargando && simulacion ? <LookIAResultPanel simulacion={simulacion} /> : null}

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Barberos recomendados para este estilo
            </h2>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              Profesionales sugeridos según la simulación seleccionada.
            </p>
          </div>
          <button
            className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b]"
            onClick={cargarBarberos}
            type="button"
          >
            Ver barberos recomendados
          </button>
        </div>

        {cargandoBarberos ? <Loading texto="Cargando barberos recomendados..." /> : null}
        {!cargandoBarberos && barberos.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
            Aún no hay barberos recomendados para esta simulación.
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {barberos.map((barbero) => (
            <BarberoRecomendadoCard barbero={barbero} key={barbero.idBarbero} />
          ))}
        </div>
      </section>

      <ConfirmModal
        abierto={modal === "regenerar"}
        cargando={procesando}
        confirmLabel="Sí, regenerar"
        loadingLabel="Regenerando..."
        mensaje="¿Seguro que deseas regenerar esta simulación? Se actualizará la imagen generada para este estilo."
        onCancel={() => setModal(null)}
        onConfirm={regenerar}
        titulo="Regenerar simulación"
      />
      <ConfirmModal
        abierto={modal === "eliminar"}
        cargando={procesando}
        confirmLabel="Sí, eliminar"
        loadingLabel="Eliminando..."
        mensaje="¿Seguro que deseas eliminar esta simulación? Esta acción cambiará su estado y no se usará para recomendaciones."
        onCancel={() => setModal(null)}
        onConfirm={eliminar}
        titulo="Eliminar simulación"
      />
    </RoleLayout>
  );
}
