"use client";

type TabModeracion = "portafolio" | "calificaciones";

type Props = {
  activa: TabModeracion;
  onCambiar: (tab: TabModeracion) => void;
};

const tabs: Array<{ id: TabModeracion; label: string }> = [
  { id: "portafolio", label: "Portafolio" },
  { id: "calificaciones", label: "Calificaciones" }
];

export function ModeracionTabs({ activa, onCambiar }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-3 sm:flex-row">
      {tabs.map((tab) => {
        const seleccionada = activa === tab.id;
        return (
          <button
            className={`rounded-lg px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
              seleccionada
                ? "border border-[#d4af37]/45 bg-[#d4af37]/10 text-[#f5d77b]"
                : "border border-white/10 bg-[#050505] text-[#b5b5b5] hover:border-[#d4af37]/35 hover:text-white"
            }`}
            key={tab.id}
            onClick={() => onCambiar(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
