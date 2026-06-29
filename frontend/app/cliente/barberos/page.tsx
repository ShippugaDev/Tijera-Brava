"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BarberoCard } from "@/components/cliente/BarberoCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { FormError } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { listarBarberos } from "@/lib/cliente-api";
import type { BarberoPublico, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

export default function ClienteBarberosPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <BarberosContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function BarberosContent({ usuario }: { usuario: UsuarioSesion }) {
  const [barberos, setBarberos] = useState<BarberoPublico[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [distrito, setDistrito] = useState("");
  const [calificacion, setCalificacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await listarBarberos({
        busqueda,
        distrito,
        calificacion_minima: calificacion,
        disponible: true,
        pagina: 1,
        limite: 12
      });
      setBarberos(response.datos ?? []);
    } catch {
      setBarberos([]);
      setError(
        "No se pudo consultar el listado de barberos. Verifica que el endpoint público GET /api/barberos esté disponible en el backend."
      );
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

  const limpiar = () => {
    setBusqueda("");
    setDistrito("");
    setCalificacion("");
    window.setTimeout(cargar, 0);
  };

  return (
    <RoleLayout
      descripcion={`Hola ${usuario.nombres}, explora profesionales disponibles y elige con quién reservar.`}
      sidebarItems={sidebarItems}
      titulo="Buscar barberos"
      usuario={usuario}
    >
      <form className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5" onSubmit={buscar}>
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="Buscar" placeholder="Carlos, taper, barba..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <Input label="Distrito" placeholder="San Miguel" value={distrito} onChange={(e) => setDistrito(e.target.value)} />
          <Input label="Calificación mínima" min={0} max={5} placeholder="4" type="number" value={calificacion} onChange={(e) => setCalificacion(e.target.value)} />
          <div className="flex items-end gap-3">
            <button className="h-12 flex-1 rounded-lg bg-[#d4af37] px-4 text-sm font-black text-black hover:bg-[#f5d77b]" type="submit">
              Buscar
            </button>
            <button className="h-12 rounded-lg border border-white/10 px-4 text-sm font-black text-[#b5b5b5] hover:border-[#d4af37]/50" onClick={limpiar} type="button">
              Limpiar
            </button>
          </div>
        </div>
      </form>

      <FormError mensaje={error} />
      {cargando ? <Loading texto="Buscando barberos..." /> : null}
      {!cargando && !error && barberos.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          No se encontraron barberos con los filtros seleccionados.
        </div>
      ) : null}
      {!cargando && barberos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {barberos.map((barbero) => (
            <BarberoCard barbero={barbero} key={barbero.idBarbero} />
          ))}
        </div>
      ) : null}
    </RoleLayout>
  );
}
