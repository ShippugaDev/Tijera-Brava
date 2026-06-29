"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { registrarCliente } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";

const correoValido = (correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export function RegistroClienteForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: ""
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const actualizar = (campo: keyof typeof form, valor: string) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const validar = () => {
    if (Object.values(form).some((valor) => !valor.trim())) {
      return "Todos los campos son obligatorios.";
    }
    if (!correoValido(form.correo)) return "Ingresa un correo válido.";
    if (form.contrasena.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (form.contrasena !== form.confirmarContrasena) {
      return "Las contraseñas no coinciden.";
    }
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setExito("");

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);
    try {
      await registrarCliente({
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        telefono: form.telefono,
        contrasena: form.contrasena
      });
      setExito("Cuenta creada correctamente. Te llevaremos al login.");
      window.setTimeout(() => router.push("/login"), 1400);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el cliente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombres" value={form.nombres} onChange={(e) => actualizar("nombres", e.target.value)} />
        <Input label="Apellidos" value={form.apellidos} onChange={(e) => actualizar("apellidos", e.target.value)} />
      </div>
      <Input label="Correo" type="email" value={form.correo} onChange={(e) => actualizar("correo", e.target.value)} />
      <Input label="Teléfono" value={form.telefono} onChange={(e) => actualizar("telefono", e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Contraseña" type="password" value={form.contrasena} onChange={(e) => actualizar("contrasena", e.target.value)} />
        <Input label="Confirmar contraseña" type="password" value={form.confirmarContrasena} onChange={(e) => actualizar("confirmarContrasena", e.target.value)} />
      </div>
      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />
      <Button
        className="w-full bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#f5d77b]"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Creando cuenta..." : "Crear cuenta de cliente"}
      </Button>
    </form>
  );
}
