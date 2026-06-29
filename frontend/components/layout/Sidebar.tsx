"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSidebarRoutes } from "@/lib/admin-navigation";

type SidebarProps = {
  titulo: string;
  items: string[];
};

const rutasCliente: Record<string, string> = {
  "Buscar barberos": "/cliente/barberos",
  "Mis reservas": "/cliente/reservas",
  LookIA: "/cliente/lookia",
  "Mis pagos": "/cliente/pagos",
  "Mis calificaciones": "/cliente/calificaciones",
  "Mi perfil": "/cliente/perfil"
};

const rutasBarbero: Record<string, string> = {
  "Mis reservas": "/barbero/reservas",
  "Mi disponibilidad": "/barbero/disponibilidad",
  "Mi portafolio": "/barbero/portafolio",
  "Mis servicios": "/barbero/servicios",
  "Mis notificaciones": "/barbero/notificaciones",
  "Mi perfil": "/barbero/perfil"
};

export function Sidebar({ titulo, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-xl border border-[#d4af37]/18 bg-[#0d0d0d]/85 p-4 shadow-xl shadow-black/20 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">{titulo}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {items.map((item, index) => {
          const href =
            titulo === "CLIENTE"
              ? rutasCliente[item]
              : titulo === "BARBERO"
                ? rutasBarbero[item]
                : titulo === "ADMINISTRADOR"
                  ? adminSidebarRoutes[item]
                  : undefined;
          const activo = href
            ? href === "/administrador" || href === "/administrador/barberos"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`)
            : index === 0;
          const clases = `rounded-lg border px-3 py-3 text-sm font-semibold transition ${
            activo
              ? "border-[#d4af37]/45 bg-[#d4af37]/10 text-[#f5d77b]"
              : "border-white/10 bg-[#050505] text-[#b5b5b5] hover:border-[#d4af37]/35 hover:text-white"
          }`;

          const contenido = (
            <>
              <span className="mr-2 text-[#d4af37]">{String(index + 1).padStart(2, "0")}</span>
              {item}
            </>
          );

          return href ? (
            <Link aria-current={activo ? "page" : undefined} className={clases} href={href} key={item}>
              {contenido}
            </Link>
          ) : (
            <div
              className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                activo
                ? "border-[#d4af37]/45 bg-[#d4af37]/10 text-[#f5d77b]"
                : "border-white/10 bg-[#050505] text-[#b5b5b5] hover:border-[#d4af37]/35 hover:text-white"
              }`}
            key={item}
          >
              {contenido}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
