"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ComprobanteForm } from "@/components/cliente/pagos/ComprobanteForm";
import { HistorialPago } from "@/components/cliente/pagos/HistorialPago";
import { PagoDetalleCard } from "@/components/cliente/pagos/PagoDetalleCard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { obtenerPagoReserva, obtenerHistorialPago, registrarComprobantePago } from "@/lib/pagos-api";
import type { HistorialPago as HistorialPagoType, PagoCliente, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];

export default function DetallePagoClientePage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <DetallePagoContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function DetallePagoContent({ usuario }: { usuario: UsuarioSesion }) {
  const params = useParams<{ id: string }>();
  const idReserva = params.id;
  const [pago, setPago] = useState<PagoCliente | null>(null);
  const [historial, setHistorial] = useState<HistorialPagoType[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargarPago = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await obtenerPagoReserva(idReserva);
      const pagoActual = response.datos.pago;
      setPago(pagoActual);
      if (pagoActual?.idPago) {
        await cargarHistorial(pagoActual.idPago);
      }
    } catch {
      setPago(null);
      setHistorial([]);
      setError("No se pudo consultar el pago.");
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async (idPago: string) => {
    try {
      const response = await obtenerHistorialPago(idPago);
      setHistorial(response.datos.historial ?? []);
    } catch {
      setHistorial([]);
    }
  };

  useEffect(() => {
    cargarPago();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idReserva]);

  const subirComprobante = async (payload: {
    comprobanteUrl: string;
    codigoOperacion: string;
    observacion?: string;
  }) => {
    setError("");
    setExito("");

    if (!payload.comprobanteUrl) {
      setError("Debes ingresar la URL del comprobante.");
      return;
    }
    if (!payload.codigoOperacion) {
      setError("Debes ingresar el código de operación.");
      return;
    }
    if (pago?.estadoPago !== "PENDIENTE") {
      setError("Este pago ya no permite comprobante.");
      return;
    }

    setSubiendo(true);
    try {
      const response = await registrarComprobantePago(idReserva, payload);
      setPago(response.datos.pago);
      setExito("Comprobante registrado correctamente.");
      if (response.datos.pago.idPago) {
        await cargarHistorial(response.datos.pago.idPago);
      }
    } catch {
      setError("No se pudo subir el comprobante.");
    } finally {
      setSubiendo(false);
    }
  };

  const permiteComprobante = pago?.estadoPago === "PENDIENTE";

  return (
    <RoleLayout
      descripcion="Consulta el estado del pago, registra comprobante y revisa su historial."
      sidebarItems={sidebarItems}
      titulo="Detalle de pago"
      usuario={usuario}
    >
      <div className="mb-6">
        <Link className="text-sm font-black text-[#f5d77b] hover:text-white" href="/cliente/pagos">
          Volver a Mis pagos
        </Link>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando detalle del pago..." /> : null}

      {!cargando && pago ? (
        <div className="grid gap-6">
          <PagoDetalleCard pago={pago} />

          {permiteComprobante ? (
            <ComprobanteForm cargando={subiendo} onSubmit={subirComprobante} />
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 text-sm text-[#b5b5b5]">
              Este pago ya no permite subir comprobante.
            </div>
          )}

          <HistorialPago historial={historial} />
        </div>
      ) : null}
    </RoleLayout>
  );
}
