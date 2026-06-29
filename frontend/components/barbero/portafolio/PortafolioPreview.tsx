"use client";

import { useState } from "react";
import { resolverUrlArchivo } from "@/lib/api";

export function PortafolioPreview({ imagenUrl, titulo }: { imagenUrl?: string | null; titulo: string }) {
  const [fallo, setFallo] = useState(false);
  const url = resolverUrlArchivo(imagenUrl);

  if (!url || fallo) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[#d4af37]/25 bg-[#171717] px-5 text-center text-sm text-[#b5b5b5]">
        Vista previa no disponible
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
      <img
        alt={titulo}
        className="h-48 w-full object-cover"
        src={url}
        onError={() => setFallo(true)}
      />
    </div>
  );
}
