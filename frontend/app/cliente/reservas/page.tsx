"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ReservaCard } from "@/components/cliente/ReservaCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { cancelarReservaCliente, listarMisReservas } from "@/lib/cliente-api";
import type { ReservaCliente, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];
const estados = ["", "PENDIENTE", "CONFIRMADA", "EN_CAMINO", "EN_SERVICIO", "FINALIZADA", "RECHAZADA"];

export default function ClienteReservasPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <ReservasContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function ReservasContent({ usuario }: { usuario: UsuarioSesion }) {
  const [reservas, setReservas] = useState<ReservaCliente[]>([]);
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [reservaACancelar, setReservaACancelar] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await listarMisReservas({ estado, desde, hasta, pagina: 1, limite: 10 });
      setReservas(response.datos ?? []);
    } catch {
      setReservas([]);
      setError("No se pudieron consultar tus reservas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    cargar();
  };

  const abrirModalCancelar = (idReserva: string) => {
    setReservaACancelar(idReserva);
  };

  const cancelar = async () => {
    if (!reservaACancelar) return;
    setError("");
    setExito("");
    setCancelando(true);
    try {
      await cancelarReservaCliente(reservaACancelar, "Cancelada desde el panel del cliente");
      setExito("Reserva cancelada correctamente.");
      setReservaACancelar(null);
      await cargar();
    } catch {
      setError("No se pudo cancelar la reserva.");
    } finally {
      setCancelando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Revisa tus citas pendientes, confirmadas o finalizadas desde tu panel personal."
      sidebarItems={sidebarItems}
      titulo="Mis reservas"
      usuario={usuario}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#b5b5b5]">Gestiona tus próximas atenciones a domicilio.</p>
        <Link className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black hover:bg-[#f5d77b]" href="/cliente/reservas/nueva">
          Nueva reserva
        </Link>
      </div>

      <form className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5" onSubmit={buscar}>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block text-sm font-medium text-neutral-200">
            Estado
            <select
              className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {estados.map((item) => (
                <option key={item || "todos"} value={item}>
                  {item || "Todos"}
                </option>
              ))}
            </select>
          </label>
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <div className="flex items-end">
            <button className="h-12 w-full rounded-lg bg-[#d4af37] px-4 text-sm font-black text-black hover:bg-[#f5d77b]" type="submit">
              Filtrar
            </button>
          </div>
        </div>
      </form>

      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />
      {cargando ? <Loading texto="Cargando reservas..." /> : null}
      {!cargando && reservas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          No tienes reservas para los filtros seleccionados.
        </div>
      ) : null}
      <div className="grid gap-4">
        {reservas.map((reserva) => (
          <ReservaCard key={reserva.idReserva} onCancelar={abrirModalCancelar} reserva={reserva} />
        ))}
      </div>
      <ConfirmModal
        abierto={Boolean(reservaACancelar)}
        cargando={cancelando}
        confirmLabel="Sí, cancelar"
        mensaje="¿Seguro que deseas cancelar esta reserva? Esta acción cambiará el estado de la reserva."
        onCancel={() => setReservaACancelar(null)}
        onConfirm={cancelar}
        titulo="Cancelar reserva"
      />
    </RoleLayout>
  );
}
