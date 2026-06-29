"use client";

export type FiltroNotificaciones = "TODAS" | "NO_LEIDAS" | "LEIDAS" | "RESERVAS" | "PAGOS" | "PORTAFOLIO" | "CALIFICACIONES";

const filtros: Array<{ label: string; value: FiltroNotificaciones }> = [
  { label: "Todas", value: "TODAS" },
  { label: "No leídas", value: "NO_LEIDAS" },
  { label: "Leídas", value: "LEIDAS" },
  { label: "Reservas", value: "RESERVAS" },
  { label: "Pagos", value: "PAGOS" },
  { label: "Portafolio", value: "PORTAFOLIO" },
  { label: "Calificaciones", value: "CALIFICACIONES" }
];

export function NotificacionesFiltros({
  filtro,
  onChange
}: {
  filtro: FiltroNotificaciones;
  onChange: (filtro: FiltroNotificaciones) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-4">
      {filtros.map((item) => (
        <button
          className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
            filtro === item.value
              ? "bg-[#d4af37] text-black"
              : "border border-white/10 text-[#b5b5b5] hover:border-[#d4af37]/40 hover:text-white"
          }`}
          key={item.value}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
