"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion, obtenerSesionActual, rutaPorRol } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormMessage";

export function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      await iniciarSesion(correo, contrasena);
      const usuario = await obtenerSesionActual();
      if (!usuario) {
        setError("No se pudo validar la sesión iniciada.");
        return;
      }
      router.replace(rutaPorRol[usuario.rol]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        label="Correo"
        name="correo"
        type="email"
        autoComplete="email"
        placeholder="cliente@tijerabrava.com"
        value={correo}
        onChange={(event) => setCorreo(event.target.value)}
        required
      />
      <Input
        label="Contraseña"
        name="contrasena"
        type="password"
        autoComplete="current-password"
        placeholder="TijeraBrava2026!"
        value={contrasena}
        onChange={(event) => setContrasena(event.target.value)}
        required
      />
      <FormError mensaje={error} />
      <Button
        className="w-full bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#f5d77b]"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
