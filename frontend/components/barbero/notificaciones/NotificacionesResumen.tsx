import type { Notificacion } from "@/lib/types";

const cuentaTipos = (notificaciones: Notificacion[], prefijos: string[]) =>
  notificaciones.filter((notificacion) =>
    prefijos.some((prefijo) => notificacion.tipo.startsWith(prefijo))
  ).length;

export function NotificacionesResumen({
  totalNoLeidas,
  notificaciones
}: {
  totalNoLeidas: number;
  notificaciones: Notificacion[];
}) {
  const items = [
    ["Notificaciones no leídas", String(totalNoLeidas)],
    ["Total de notificaciones", String(notificaciones.length)],
    ["Reservas", String(cuentaTipos(notificaciones, ["RESERVA_"]))],
    ["Pagos", String(cuentaTipos(notificaciones, ["PAGO_"]))],
    ["Portafolio", String(cuentaTipos(notificaciones, ["PORTAFOLIO_"]))],
    ["Calificaciones", String(cuentaTipos(notificaciones, ["CALIFICACION_"]))]
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      {items.map(([titulo, valor]) => (
        <div
          className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 text-center shadow-xl shadow-black/20"
          key={titulo}
        >
          <p className="max-w-[150px] text-center text-sm leading-snug text-[#b5b5b5]">
            {titulo}
          </p>
          <p className="mt-3 text-4xl font-black leading-none text-white">{valor}</p>
        </div>
      ))}
    </div>
  );
}
