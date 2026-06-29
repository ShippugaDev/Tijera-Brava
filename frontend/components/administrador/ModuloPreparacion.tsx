"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { adminSidebarItems } from "@/lib/admin-navigation";

type ModuloPreparacionProps = {
  titulo: string;
};

export function ModuloPreparacion({ titulo }: ModuloPreparacionProps) {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Este apartado quedará listo en una fase posterior."
          sidebarItems={adminSidebarItems}
          titulo={titulo}
          usuario={usuario}
        >
          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <p className="text-lg font-black text-white">Módulo en preparación</p>
            <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
              La navegación ya está disponible y protegida para administradores.
            </p>
          </Card>
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
