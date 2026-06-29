"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cerrarSesion } from "@/lib/auth";
import { resolverUrlArchivo } from "@/lib/api";
import type { UsuarioSesion } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/RoleBadge";

const getLogoHref = (pathname: string) => {
  if (pathname.startsWith("/cliente")) return "/cliente";
  if (pathname.startsWith("/barbero")) return "/barbero";
  if (pathname.startsWith("/administrador")) return "/administrador";
  return "/";
};

export function Navbar({ usuario }: { usuario?: UsuarioSesion }) {
  const router = useRouter();
  const pathname = usePathname();
  const [fotoFallida, setFotoFallida] = useState(false);
  const logoHref = getLogoHref(pathname);
  const iniciales = usuario
    ? `${usuario.nombres} ${usuario.apellidos ?? ""}`
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase())
        .join("") || "TB"
    : "TB";
  const fotoUrl = resolverUrlArchivo(usuario?.fotoPerfilUrl);

  useEffect(() => {
    setFotoFallida(false);
  }, [fotoUrl]);

  const handleLogout = async () => {
    await cerrarSesion().catch(() => null);
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#d4af37]/15 bg-[#050505]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link className="text-xl font-black tracking-tight text-white" href={logoHref}>
          Tijera <span className="text-[#d4af37]">Brava</span>
        </Link>
        <nav className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="hidden items-center gap-3 sm:flex">
                {fotoUrl && !fotoFallida ? (
                  <img
                    alt={`Foto de ${usuario.nombres}`}
                    className="h-9 w-9 rounded-full border border-[#d4af37]/35 object-cover"
                    onError={() => setFotoFallida(true)}
                    src={fotoUrl}
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d4af37]/35 bg-[#17110a] text-xs font-black text-[#f5d77b]">
                    {iniciales}
                  </span>
                )}
                <span className="text-sm font-semibold text-[#b5b5b5]">{usuario.nombres}</span>
                <RoleBadge rol={usuario.rol} />
              </div>
              <Button
                className="border-[#d4af37]/45 bg-[#0d0d0d] text-[#f5d77b] hover:border-[#f5d77b] hover:bg-[#d4af37]/10"
                onClick={handleLogout}
                type="button"
                variant="secondary"
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Link
              className="rounded-lg border border-[#d4af37]/45 px-4 py-2 text-sm font-semibold text-[#f5d77b] transition hover:border-[#f5d77b]"
              href="/login"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
