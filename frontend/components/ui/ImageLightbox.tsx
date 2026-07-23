"use client";

import { useEffect } from "react";

type ImageLightboxProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt = "Imagen ampliada", onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowPrevio;
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="relative max-h-[80vh] max-w-[90vw] sm:max-w-[80vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Cerrar imagen ampliada"
          className="absolute -top-12 right-0 rounded-full border border-[#d4af37]/45 bg-black px-4 py-2 text-sm font-semibold text-white transition hover:border-[#f5d77b] hover:bg-[#d4af37] hover:text-black"
          onClick={onClose}
          type="button"
        >
          Cerrar
        </button>
        <img
          alt={alt}
          className="max-h-[80vh] max-w-[90vw] rounded-2xl border border-[#d4af37]/30 object-contain shadow-[0_0_60px_rgba(212,175,55,0.2)] sm:max-w-[80vw]"
          src={src}
        />
      </div>
    </div>
  );
}
