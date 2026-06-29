"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { FiltrosEstadisticas } from "@/lib/admin-estadisticas-api";

type Props = {
  filtros: FiltrosEstadisticas;
  onAplicar: (filtros: FiltrosEstadisticas) => void;
};

export function FiltrosFecha({ filtros, onAplicar }: Props) {
  const [desde, setDesde] = useState(filtros.desde ?? "");
  const [hasta, setHasta] = useState(filtros.hasta ?? "");

  const aplicar = (event: FormEvent) => {
    event.preventDefault();
    onAplicar({ desde, hasta });
  };

  return (
    <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
      <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]" onSubmit={aplicar}>
        <Input label="Fecha desde" onChange={(event) => setDesde(event.target.value)} type="date" value={desde} />
        <Input label="Fecha hasta" onChange={(event) => setHasta(event.target.value)} type="date" value={hasta} />
        <Button className="self-end bg-[#d4af37] text-black hover:bg-[#f5d77b]" type="submit">
          Aplicar filtros
        </Button>
        <Button
          className="self-end"
          onClick={() => {
            setDesde("");
            setHasta("");
            onAplicar({});
          }}
          type="button"
          variant="secondary"
        >
          Limpiar
        </Button>
      </form>
    </Card>
  );
}
