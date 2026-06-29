"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { obtenerSesionActual, rutaPorRol } from "@/lib/auth";
import type { RolUsuario, UsuarioSesion } from "@/lib/types";
import { Loading } from "@/components/ui/Loading";

type ProtectedRouteProps = {
  rolPermitido: RolUsuario;
  children: (usuario: UsuarioSesion) => ReactNode;
};

export function ProtectedRoute({ rolPermitido, children }: ProtectedRouteProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [estado, setEstado] = useState<"cargando" | "autorizado" | "denegado">("cargando");

  useEffect(() => {
    let activo = true;

    obtenerSesionActual()
      .then((sesion) => {
        if (!activo) return;
        if (!sesion) {
          router.replace("/login");
          return;
        }
        if (sesion.rol !== rolPermitido) {
          setEstado("denegado");
          window.setTimeout(() => router.replace(rutaPorRol[sesion.rol]), 1200);
          return;
        }
        setUsuario(sesion);
        setEstado("autorizado");
      })
      .catch(() => {
        if (!activo) return;
        router.replace("/login");
      });

    return () => {
      activo = false;
    };
  }, [rolPermitido, router]);

  if (estado === "cargando") return <Loading texto="Validando sesión..." />;

  if (estado === "denegado") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <section className="max-w-md rounded-lg border border-red-500/30 bg-red-950/20 p-6 text-center">
          <h1 className="text-xl font-bold">Acceso no autorizado</h1>
          <p className="mt-3 text-sm text-neutral-300">
            Tu rol no tiene permisos para ver esta sección.
          </p>
        </section>
      </main>
    );
  }

  return usuario ? <>{children(usuario)}</> : null;
}
