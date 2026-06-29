"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { DashboardCard, SummaryCard } from "@/components/ui/DashboardCard";

const modulos = [
  {
    icono: "BB",
    titulo: "Buscar barberos",
    descripcion: "Explora profesionales disponibles y elige el estilo que necesitas.",
    href: "/cliente/barberos"
  },
  {
    icono: "MR",
    titulo: "Mis reservas",
    descripcion: "Revisa tus citas pendientes, confirmadas o finalizadas.",
    href: "/cliente/reservas"
  },
  {
    icono: "IA",
    titulo: "LookIA",
    descripcion: "Prueba estilos antes de reservar tu próximo corte.",
    href: "/cliente/lookia"
  },
  {
    icono: "MP",
    titulo: "Mis pagos",
    descripcion: "Consulta tus pagos y comprobantes asociados."
  },
  {
    icono: "MC",
    titulo: "Mis calificaciones",
    descripcion: "Revisa las opiniones que dejaste sobre tus servicios.",
    href: "/cliente/calificaciones"
  },
  {
    icono: "PF",
    titulo: "Mi perfil",
    descripcion: "Actualiza tu foto y revisa los datos básicos de tu cuenta.",
    href: "/cliente/perfil"
  }
];

const resumen = [
  ["Próxima reserva", "Pendiente", "Agenda inicial"],
  ["Simulación LookIA", "Lista", "Estilo sugerido"],
  ["Pago pendiente", "S/ 0.00", "Sin alertas"]
];

export default function ClientePage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => (
        <RoleLayout
          descripcion="Gestiona tus reservas, pagos y simulaciones desde tu panel personal."
          sidebarItems={modulos.map((modulo) => modulo.titulo)}
          titulo={`Bienvenido, ${usuario.nombres}`}
          usuario={usuario}
        >
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {resumen.map(([titulo, valor, detalle]) => (
              <SummaryCard detalle={detalle} key={titulo} titulo={titulo} valor={valor} />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modulos.map((modulo) => (
              <DashboardCard
                descripcion={modulo.descripcion}
                href={modulo.href}
                icono={modulo.icono}
                key={modulo.titulo}
                titulo={modulo.titulo}
              />
            ))}
          </div>
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
