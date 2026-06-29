import type { ZonaBarbero } from "@/lib/types";

export function DireccionSelector({
  zonas,
  seleccionada,
  onChange
}: {
  zonas: ZonaBarbero[];
  seleccionada: string;
  onChange: (idZonaCobertura: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {zonas.map((zona) => {
        const id = zona.idZonaCobertura;
        const activa = seleccionada === id;
        const nombre = zona.zonaCobertura?.nombre ?? zona.nombre ?? "Zona de cobertura";
        const distrito = zona.zonaCobertura?.distrito ?? zona.distrito;
        return (
          <button
            className={`rounded-xl border p-4 text-left transition ${
              activa
                ? "border-[#d4af37] bg-[#d4af37]/10"
                : "border-white/10 bg-[#0d0d0d] hover:border-[#d4af37]/50"
            }`}
            key={id}
            onClick={() => onChange(id)}
            type="button"
          >
            <p className="font-black text-white">{nombre}</p>
            <p className="mt-2 text-sm text-[#b5b5b5]">{distrito ?? "Distrito disponible"}</p>
            <p className="mt-2 text-sm font-black text-[#f5d77b]">
              Traslado: S/ {Number(zona.costoTraslado ?? 0).toFixed(2)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
