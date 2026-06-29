"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DireccionSelector } from "@/components/cliente/DireccionSelector";
import { DisponibilidadPicker } from "@/components/cliente/DisponibilidadPicker";
import { ServicioSelector } from "@/components/cliente/ServicioSelector";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import {
  consultarDisponibilidad,
  crearReserva,
  listarServiciosBarbero,
  listarZonasBarbero
} from "@/lib/cliente-api";
import type { HorarioDisponible, ServicioBarbero, UsuarioSesion, ZonaBarbero } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];
const metodosPago = ["YAPE", "PLIN", "EFECTIVO", "TRANSFERENCIA"];

export default function NuevaReservaPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => (
        <Suspense fallback={<Loading texto="Preparando reserva..." />}>
          <NuevaReservaContent usuario={usuario} />
        </Suspense>
      )}
    </ProtectedRoute>
  );
}

function NuevaReservaContent({ usuario }: { usuario: UsuarioSesion }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idBarbero = searchParams.get("idBarbero") ?? "";
  const [servicios, setServicios] = useState<ServicioBarbero[]>([]);
  const [zonas, setZonas] = useState<ZonaBarbero[]>([]);
  const [idServicio, setIdServicio] = useState("");
  const [idZonaCobertura, setIdZonaCobertura] = useState("");
  const [fecha, setFecha] = useState("");
  const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [metodoPago, setMetodoPago] = useState("YAPE");
  const [indicaciones, setIndicaciones] = useState("");
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [consultando, setConsultando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    if (!idBarbero) return;
    let activo = true;

    const cargarDatos = async () => {
      setCargandoDatos(true);
      setError("");
      try {
        const [serviciosResponse, zonasResponse] = await Promise.all([
          listarServiciosBarbero(idBarbero),
          listarZonasBarbero(idBarbero)
        ]);
        if (!activo) return;
        setServicios(serviciosResponse.datos);
        setZonas(zonasResponse.datos);
        setIdServicio(serviciosResponse.datos[0]?.idServicio ?? "");
        setIdZonaCobertura(zonasResponse.datos[0]?.idZonaCobertura ?? "");
      } catch {
        setError("No se pudieron cargar los servicios o zonas del barbero.");
      } finally {
        if (activo) setCargandoDatos(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, [idBarbero]);

  const buscarDisponibilidad = async () => {
    setError("");
    setExito("");
    setHoraInicio("");

    if (!idBarbero) {
      setError("Selecciona un barbero para continuar.");
      return;
    }
    if (!idServicio) {
      setError("Selecciona un servicio.");
      return;
    }
    if (!idZonaCobertura) {
      setError("Selecciona una zona de cobertura.");
      return;
    }
    if (!fecha) {
      setError("Selecciona una fecha.");
      return;
    }

    setConsultando(true);
    try {
      const response = await consultarDisponibilidad({
        idBarbero,
        fecha,
        idServicio,
        idZonaCobertura
      });
      setHorarios(response.datos.horarios ?? []);
    } catch {
      setHorarios([]);
      setError("No se pudo consultar disponibilidad para esa fecha.");
    } finally {
      setConsultando(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setExito("");

    if (!idBarbero || !idServicio || !idZonaCobertura || !fecha || !horaInicio) {
      setError("Completa barbero, servicio, zona, fecha y horario.");
      return;
    }

    setCreando(true);
    try {
      await crearReserva({
        idBarbero,
        idServicio,
        idZonaCobertura,
        fechaReserva: fecha,
        horaInicio,
        metodoPago,
        indicacionesCliente: indicaciones || undefined
      });
      setExito("Reserva creada correctamente. Te llevaremos a tus reservas.");
      window.setTimeout(() => router.push("/cliente/reservas"), 1200);
    } catch {
      setError("No se pudo crear la reserva. Verifica disponibilidad y datos seleccionados.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Selecciona barbero, servicio, zona y horario para crear tu reserva."
      sidebarItems={sidebarItems}
      titulo="Nueva reserva"
      usuario={usuario}
    >
      {!idBarbero ? (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
          <h2 className="text-2xl font-black">Primero elige un barbero</h2>
          <p className="mt-3 text-[#b5b5b5]">
            Para iniciar una reserva necesitas seleccionar un barbero desde el buscador.
          </p>
          <Link className="mt-5 inline-flex rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-black text-black hover:bg-[#f5d77b]" href="/cliente/barberos">
            Buscar barberos
          </Link>
        </Card>
      ) : (
        <form className="space-y-6" onSubmit={submit}>
          <FormError mensaje={error} />
          <FormSuccess mensaje={exito} />
          {cargandoDatos ? <Loading texto="Cargando servicios y zonas..." /> : null}

          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <h2 className="text-xl font-black">1. Servicio</h2>
            <p className="mt-2 text-sm text-[#b5b5b5]">Elige el servicio que deseas reservar.</p>
            <div className="mt-4">
              <ServicioSelector onChange={setIdServicio} seleccionado={idServicio} servicios={servicios} />
            </div>
          </Card>

          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <h2 className="text-xl font-black">2. Zona de cobertura</h2>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              En esta fase se selecciona la zona atendida por el barbero. El módulo de direcciones queda para una fase posterior.
            </p>
            <div className="mt-4">
              <DireccionSelector onChange={setIdZonaCobertura} seleccionada={idZonaCobertura} zonas={zonas} />
            </div>
          </Card>

          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <h2 className="text-xl font-black">3. Fecha y disponibilidad</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <Input label="Fecha de reserva" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              <button className="h-12 rounded-lg border border-[#d4af37]/50 px-5 text-sm font-black text-[#f5d77b] hover:bg-[#d4af37]/10" disabled={consultando} onClick={buscarDisponibilidad} type="button">
                {consultando ? "Consultando..." : "Consultar horarios"}
              </button>
            </div>
            <div className="mt-4">
              <DisponibilidadPicker horarios={horarios} onChange={setHoraInicio} seleccionado={horaInicio} />
            </div>
          </Card>

          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <h2 className="text-xl font-black">4. Pago e indicaciones</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-neutral-200">
                Método de pago
                <select
                  className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo} value={metodo}>{metodo}</option>
                  ))}
                </select>
              </label>
              <Input label="Indicaciones" placeholder="Deseo un corte taper fade." value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} />
            </div>
          </Card>

          <button className="w-full rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-black text-black hover:bg-[#f5d77b] disabled:opacity-60" disabled={creando} type="submit">
            {creando ? "Creando reserva..." : "Crear reserva"}
          </button>
        </form>
      )}
    </RoleLayout>
  );
}
