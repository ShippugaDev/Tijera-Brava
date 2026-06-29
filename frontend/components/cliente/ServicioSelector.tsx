import type { ServicioBarbero } from "@/lib/types";

export function ServicioSelector({
  servicios,
  seleccionado,
  onChange
}: {
  servicios: ServicioBarbero[];
  seleccionado: string;
  onChange: (idServicio: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {servicios.map((servicio) => {
        const id = servicio.idServicio;
        const activo = seleccionado === id;
        return (
          <button
            className={`rounded-xl border p-4 text-left transition ${
              activo
                ? "border-[#d4af37] bg-[#d4af37]/10"
                : "border-white/10 bg-[#0d0d0d] hover:border-[#d4af37]/50"
            }`}
            key={id}
            onClick={() => onChange(id)}
            type="button"
          >
            <p className="font-black text-white">{servicio.servicio?.nombre ?? servicio.nombre}</p>
            <p className="mt-2 text-sm text-[#b5b5b5]">
              Duración: {servicio.duracionFinal ?? servicio.duracionPersonalizada ?? servicio.servicio?.duracionMinutos ?? "-"} min
            </p>
            <p className="mt-2 text-sm font-black text-[#f5d77b]">
              S/ {Number(servicio.precioFinal ?? servicio.precioPersonalizado ?? servicio.servicio?.precioBase ?? 0).toFixed(2)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
