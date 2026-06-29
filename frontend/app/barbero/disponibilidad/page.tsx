"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BloqueoCard } from "@/components/barbero/disponibilidad/BloqueoCard";
import { BloqueoForm } from "@/components/barbero/disponibilidad/BloqueoForm";
import { EditarHorarioModal } from "@/components/barbero/disponibilidad/EditarHorarioModal";
import { HorarioCard } from "@/components/barbero/disponibilidad/HorarioCard";
import { HorarioForm } from "@/components/barbero/disponibilidad/HorarioForm";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import {
  actualizarHorario,
  crearBloqueo,
  crearHorario,
  eliminarBloqueo,
  eliminarHorario,
  listarMisBloqueos,
  listarMisHorarios,
  reactivarHorario
} from "@/lib/barbero-disponibilidad-api";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type {
  BloqueoHorario,
  DiaSemana,
  HorarioDisponibilidad,
  UsuarioSesion
} from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones"
];

const horaFinMayor = (inicio: string, fin: string) => inicio < fin;

const fechaHoraIso = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00`).toISOString();

const horariosRetiradosUnicos = (horarios: HorarioDisponibilidad[]) => {
  const vistos = new Set<string>();
  return horarios.filter((horario) => {
    const clave = `${horario.diaSemana}-${horario.horaInicio}-${horario.horaFin}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
};

const mensajeErrorDisponibilidad = (mensajeBase: string, error: unknown) => {
  const mensaje = error instanceof Error ? error.message.toLowerCase() : "";
  if (mensaje.includes("superpone") && mensaje.includes("horario")) {
    return "El horario se superpone con otro horario existente.";
  }
  if (mensaje.includes("superpone") && mensaje.includes("bloqueo")) {
    return "El bloqueo se superpone con otro bloqueo o reserva existente.";
  }
  return mensajeBase;
};

export default function BarberoDisponibilidadPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <DisponibilidadContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function DisponibilidadContent({ usuario }: { usuario: UsuarioSesion }) {
  const [horarios, setHorarios] = useState<HorarioDisponibilidad[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoHorario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const [guardandoBloqueo, setGuardandoBloqueo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [horarioEditando, setHorarioEditando] = useState<HorarioDisponibilidad | null>(null);
  const [horarioAEliminar, setHorarioAEliminar] = useState<HorarioDisponibilidad | null>(null);
  const [horarioAReactivar, setHorarioAReactivar] = useState<HorarioDisponibilidad | null>(null);
  const [bloqueoAEliminar, setBloqueoAEliminar] = useState<BloqueoHorario | null>(null);

  const horariosActivos = useMemo(
    () => horarios.filter((horario) => horario.activo !== false),
    [horarios]
  );
  const horariosRetirados = useMemo(
    () => horariosRetiradosUnicos(horarios.filter((horario) => horario.activo === false)),
    [horarios]
  );

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [horariosResponse, bloqueosResponse] = await Promise.all([
        listarMisHorarios(),
        listarMisBloqueos({ pagina: 1, limite: 20, activo: true })
      ]);
      setHorarios(horariosResponse.datos ?? []);
      setBloqueos(bloqueosResponse.datos ?? []);
    } catch {
      setHorarios([]);
      setBloqueos([]);
      setError("No se pudieron cargar tus horarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crearNuevoHorario = async (payload: {
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
  }) => {
    setError("");
    setExito("");
    if (!payload.diaSemana || !payload.horaInicio || !payload.horaFin) {
      setError("Completa día, hora inicio y hora fin.");
      return;
    }
    if (!horaFinMayor(payload.horaInicio, payload.horaFin)) {
      setError("La hora de fin debe ser mayor que la hora de inicio.");
      return;
    }
    setGuardandoHorario(true);
    try {
      await crearHorario(payload);
      setExito("Horario creado correctamente.");
      await cargar();
    } catch (err) {
      setError(mensajeErrorDisponibilidad("No se pudo crear el horario.", err));
    } finally {
      setGuardandoHorario(false);
    }
  };

  const guardarEdicionHorario = async (payload: {
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
  }) => {
    if (!horarioEditando) return;
    setError("");
    setExito("");
    if (!horaFinMayor(payload.horaInicio, payload.horaFin)) {
      setError("La hora de fin debe ser mayor que la hora de inicio.");
      return;
    }
    setProcesando(true);
    try {
      await actualizarHorario(horarioEditando.idHorarioDisponibilidad, payload);
      setExito("Horario actualizado correctamente.");
      setHorarioEditando(null);
      await cargar();
    } catch (err) {
      setError(mensajeErrorDisponibilidad("No se pudo actualizar el horario.", err));
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminarHorario = async () => {
    if (!horarioAEliminar) return;
    setError("");
    setExito("");
    setProcesando(true);
    try {
      await eliminarHorario(horarioAEliminar.idHorarioDisponibilidad);
      setExito("Horario eliminado correctamente.");
      setHorarioAEliminar(null);
      await cargar();
    } catch {
      setError("No se pudo eliminar el horario.");
    } finally {
      setProcesando(false);
    }
  };

  const confirmarReactivarHorario = async () => {
    if (!horarioAReactivar) return;
    setError("");
    setExito("");
    setProcesando(true);
    try {
      const response = await reactivarHorario(horarioAReactivar.idHorarioDisponibilidad);
      setExito(response.mensaje ?? "Horario reactivado correctamente.");
      setHorarioAReactivar(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reactivar el horario.");
    } finally {
      setProcesando(false);
    }
  };

  const crearNuevoBloqueo = async (payload: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
  }) => {
    setError("");
    setExito("");
    if (!payload.fecha || !payload.horaInicio || !payload.horaFin) {
      setError("Completa fecha, hora inicio y hora fin.");
      return;
    }
    if (!payload.motivo) {
      setError("Ingresa un motivo para el bloqueo.");
      return;
    }
    if (!horaFinMayor(payload.horaInicio, payload.horaFin)) {
      setError("La hora de fin debe ser mayor que la hora de inicio.");
      return;
    }
    setGuardandoBloqueo(true);
    try {
      await crearBloqueo({
        fechaInicio: fechaHoraIso(payload.fecha, payload.horaInicio),
        fechaFin: fechaHoraIso(payload.fecha, payload.horaFin),
        motivo: payload.motivo
      });
      setExito("Bloqueo creado correctamente.");
      await cargar();
    } catch (err) {
      setError(mensajeErrorDisponibilidad("No se pudo crear el bloqueo.", err));
    } finally {
      setGuardandoBloqueo(false);
    }
  };

  const confirmarEliminarBloqueo = async () => {
    if (!bloqueoAEliminar) return;
    setError("");
    setExito("");
    setProcesando(true);
    try {
      await eliminarBloqueo(bloqueoAEliminar.idBloqueoHorario);
      setExito("Bloqueo eliminado correctamente.");
      setBloqueoAEliminar(null);
      await cargar();
    } catch {
      setError("No se pudo eliminar el bloqueo.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Administra tus horarios recurrentes y bloqueos de agenda."
      sidebarItems={sidebarItems}
      titulo="Mi disponibilidad"
      usuario={usuario}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Horarios recurrentes</p>
          <p className="mt-2 text-3xl font-black text-white">{horariosActivos.length}</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Bloqueos activos</p>
          <p className="mt-2 text-3xl font-black text-white">{bloqueos.length}</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
          <p className="text-sm text-[#b5b5b5]">Gestión</p>
          <p className="mt-2 text-lg font-black text-[#f5d77b]">Agenda a domicilio</p>
        </div>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando disponibilidad..." /> : null}

      {!cargando ? (
        <div className="mt-5 grid gap-6">
          <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
            <h2 className="text-xl font-black text-white">Crear horario recurrente</h2>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              Define los días y horas donde atiendes normalmente.
            </p>
            <div className="mt-5">
              <HorarioForm
                cargando={guardandoHorario}
                submitLabel="Crear horario"
                onSubmit={crearNuevoHorario}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">Horarios recurrentes</h2>
            {horariosActivos.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
                Aún no tienes horarios recurrentes.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {horariosActivos.map((horario) => (
                  <HorarioCard
                    horario={horario}
                    key={horario.idHorarioDisponibilidad}
                    onEditar={setHorarioEditando}
                    onEliminar={setHorarioAEliminar}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-black text-white">Horarios retirados</h2>
            {horariosRetirados.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
                No tienes horarios retirados.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {horariosRetirados.map((horario) => (
                  <HorarioRetiradoCard
                    horario={horario}
                    key={horario.idHorarioDisponibilidad}
                    onReactivar={setHorarioAReactivar}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
            <h2 className="text-xl font-black text-white">Crear bloqueo</h2>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              Bloquea horas puntuales por descanso, traslado o imprevistos.
            </p>
            <div className="mt-5">
              <BloqueoForm cargando={guardandoBloqueo} onSubmit={crearNuevoBloqueo} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">Bloqueos de agenda</h2>
            {bloqueos.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
                Aún no tienes bloqueos registrados.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bloqueos.map((bloqueo) => (
                  <BloqueoCard
                    bloqueo={bloqueo}
                    key={bloqueo.idBloqueoHorario}
                    onEliminar={setBloqueoAEliminar}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <EditarHorarioModal
        abierto={Boolean(horarioEditando)}
        cargando={procesando}
        horario={horarioEditando}
        onCancel={() => setHorarioEditando(null)}
        onSubmit={guardarEdicionHorario}
      />

      <ConfirmModal
        abierto={Boolean(horarioAEliminar)}
        cargando={procesando}
        confirmLabel="Sí, eliminar"
        loadingLabel="Eliminando..."
        mensaje="¿Seguro que deseas eliminar este horario recurrente?"
        onCancel={() => setHorarioAEliminar(null)}
        onConfirm={confirmarEliminarHorario}
        titulo="Eliminar horario"
      />

      <ConfirmModal
        abierto={Boolean(horarioAReactivar)}
        cargando={procesando}
        confirmLabel="Sí, reactivar"
        loadingLabel="Reactivando..."
        mensaje="¿Deseas reactivar este horario recurrente?"
        onCancel={() => setHorarioAReactivar(null)}
        onConfirm={confirmarReactivarHorario}
        titulo="Reactivar horario"
      />

      <ConfirmModal
        abierto={Boolean(bloqueoAEliminar)}
        cargando={procesando}
        confirmLabel="Sí, eliminar"
        loadingLabel="Eliminando..."
        mensaje="¿Seguro que deseas eliminar este bloqueo de agenda?"
        onCancel={() => setBloqueoAEliminar(null)}
        onConfirm={confirmarEliminarBloqueo}
        titulo="Eliminar bloqueo"
      />
    </RoleLayout>
  );
}

function HorarioRetiradoCard({
  horario,
  onReactivar
}: {
  horario: HorarioDisponibilidad;
  onReactivar: (horario: HorarioDisponibilidad) => void;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {horario.diaSemana}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {horario.horaInicio} - {horario.horaFin}
          </h3>
        </div>
        <span className={getEstadoBadgeClass("INACTIVO")}>
          INACTIVO
        </span>
      </div>
      <button
        className="mt-5 w-full rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
        onClick={() => onReactivar(horario)}
        type="button"
      >
        Reactivar
      </button>
    </article>
  );
}
