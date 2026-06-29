"use client";

type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div>
      <p className="text-sm font-medium text-neutral-200">Puntuación</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((puntuacion) => (
          <button
            className={`rounded-lg border px-4 py-3 text-lg font-black transition ${
              value >= puntuacion
                ? "border-[#d4af37] bg-[#d4af37]/15 text-[#f5d77b]"
                : "border-white/10 bg-[#171717] text-[#b5b5b5] hover:border-[#d4af37]/40"
            }`}
            key={puntuacion}
            onClick={() => onChange(puntuacion)}
            type="button"
          >
            ★
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#b5b5b5]">{value ? `${value} de 5` : "Selecciona una puntuación"}</p>
    </div>
  );
}
