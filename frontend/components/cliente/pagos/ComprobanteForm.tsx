"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";

type ComprobanteFormProps = {
  cargando: boolean;
  onSubmit: (payload: {
    comprobanteUrl: string;
    codigoOperacion: string;
    observacion?: string;
  }) => void;
};

export function ComprobanteForm({ cargando, onSubmit }: ComprobanteFormProps) {
  const [comprobanteUrl, setComprobanteUrl] = useState("https://example.com/comprobante-yape.jpg");
  const [codigoOperacion, setCodigoOperacion] = useState("YP-CLIENTE-001");
  const [observacion, setObservacion] = useState("Pago realizado por Yape");

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      comprobanteUrl: comprobanteUrl.trim(),
      codigoOperacion: codigoOperacion.trim(),
      observacion: observacion.trim() || undefined
    });
  };

  return (
    <form
      className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20"
      onSubmit={enviar}
    >
      <h2 className="text-xl font-black text-white">Subir comprobante</h2>
      <p className="mt-2 text-sm text-[#b5b5b5]">
        En esta fase se registra una URL de prueba, sin subida real de archivo.
      </p>
      <div className="mt-5 grid gap-4">
        <Input
          label="URL del comprobante"
          name="comprobanteUrl"
          value={comprobanteUrl}
          onChange={(event) => setComprobanteUrl(event.target.value)}
        />
        <Input
          label="Código de operación"
          name="codigoOperacion"
          value={codigoOperacion}
          onChange={(event) => setCodigoOperacion(event.target.value)}
        />
        <Input
          label="Observación"
          name="observacion"
          value={observacion}
          onChange={(event) => setObservacion(event.target.value)}
        />
      </div>
      <button
        className="mt-5 w-full rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Registrando comprobante..." : "Registrar comprobante"}
      </button>
    </form>
  );
}
