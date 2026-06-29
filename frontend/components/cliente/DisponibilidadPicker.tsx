import type { HorarioDisponible } from "@/lib/types";

export function DisponibilidadPicker({
  horarios,
  seleccionado,
  onChange
}: {
  horarios: HorarioDisponible[];
  seleccionado: string;
  onChange: (horaInicio: string) => void;
}) {
  if (horarios.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 text-sm text-[#b5b5b5]">
        No hay horarios disponibles para la fecha seleccionada.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {horarios.map((horario) => {
        const activo = seleccionado === horario.horaInicio;
        return (
          <button
            className={`rounded-xl border px-4 py-3 text-left font-black transition ${
              activo
                ? "border-[#d4af37] bg-[#d4af37]/10 text-[#f5d77b]"
                : "border-white/10 bg-[#0d0d0d] text-white hover:border-[#d4af37]/50"
            }`}
            key={`${horario.horaInicio}-${horario.horaFin}`}
            onClick={() => onChange(horario.horaInicio)}
            type="button"
          >
            {horario.horaInicio} - {horario.horaFin}
          </button>
        );
      })}
    </div>
  );
}
