import { apiFetch } from "@/lib/api";
import type { ApiResponse, HistorialPago, PagoCliente } from "@/lib/types";

export async function obtenerPagoReserva(idReserva: string) {
  return apiFetch<ApiResponse<{ pago: PagoCliente }>>(`/reservas/${idReserva}/pago`);
}

export async function registrarComprobantePago(
  idReserva: string,
  payload: {
    comprobanteUrl: string;
    codigoOperacion: string;
    observacion?: string;
  }
) {
  return apiFetch<ApiResponse<{ pago: PagoCliente }>>(
    `/reservas/${idReserva}/pago/comprobante`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function obtenerHistorialPago(idPago: string) {
  return apiFetch<ApiResponse<{ historial: HistorialPago[] }>>(`/pagos/${idPago}/historial`);
}
