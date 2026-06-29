import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import type { UsuarioSesion } from "@/lib/types";

type RoleLayoutProps = {
  usuario: UsuarioSesion;
  titulo: string;
  descripcion: string;
  sidebarItems: string[];
  children: ReactNode;
};

export function RoleLayout({
  usuario,
  titulo,
  descripcion,
  sidebarItems,
  children
}: RoleLayoutProps) {
  const tienePerfilPropio = usuario.rol === "BARBERO" || usuario.rol === "CLIENTE";
  const itemsFinales =
    tienePerfilPropio && !sidebarItems.includes("Mi perfil")
      ? [...sidebarItems, "Mi perfil"]
      : sidebarItems;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_8%,rgba(212,175,55,0.13),transparent_28%),linear-gradient(135deg,#050505,#0d0d0d_55%,#050505)]" />
      <Navbar usuario={usuario} />
      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_1fr]">
        <Sidebar items={itemsFinales} titulo={usuario.rol} />
        <section>
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
              Panel Tijera Brava
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{titulo}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-[#b5b5b5]">{descripcion}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
