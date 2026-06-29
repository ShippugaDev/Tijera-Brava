import { Card } from "@/components/ui/Card";

type Props = {
  titulo: string;
  valor: string | number;
  detalle?: string;
};

export function EstadisticaCard({ titulo, valor, detalle }: Props) {
  return (
    <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
      <p className="text-sm text-[#b5b5b5]">{titulo}</p>
      <p className="mt-2 text-3xl font-black text-white">{valor}</p>
      {detalle ? (
        <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#d4af37]">
          {detalle}
        </p>
      ) : null}
    </Card>
  );
}
