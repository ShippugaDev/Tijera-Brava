"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { registrarBarbero } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";

const correoValido = (correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export function RegistroBarberoForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
    nombreProfesional: "",
    biografia: "",
    anosExperiencia: "",
    especialidadPrincipal: ""
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const actualizar = (campo: keyof typeof form, valor: string) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const validar = () => {
    const obligatorios = [
      form.nombres,
      form.apellidos,
      form.correo,
      form.telefono,
      form.contrasena,
      form.confirmarContrasena,
      form.nombreProfesional,
      form.anosExperiencia,
      form.especialidadPrincipal
    ];

    if (obligatorios.some((valor) => !valor.trim())) return "Completa todos los campos obligatorios.";
    if (!correoValido(form.correo)) return "Ingresa un correo válido.";
    if (form.contrasena.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (form.contrasena !== form.confirmarContrasena) return "Las contraseñas no coinciden.";

    const anos = Number(form.anosExperiencia);
    if (!Number.isInteger(anos) || anos < 0) {
      return "Los años de experiencia deben ser un número entero mayor o igual a 0.";
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
      await registrarBarbero({
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        telefono: form.telefono,
        contrasena: form.contrasena,
        nombreProfesional: form.nombreProfesional,
        biografia: form.biografia || `Especialidad principal: ${form.especialidadPrincipal}`,
        anosExperiencia: Number(form.anosExperiencia)
      });
      setExito(
        "Tu solicitud fue enviada correctamente. Un administrador revisará tu perfil antes de activar tu cuenta como barbero."
      );
      window.setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar la solicitud.");
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Correo" type="email" value={form.correo} onChange={(e) => actualizar("correo", e.target.value)} />
        <Input label="Teléfono" value={form.telefono} onChange={(e) => actualizar("telefono", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Contraseña" type="password" value={form.contrasena} onChange={(e) => actualizar("contrasena", e.target.value)} />
        <Input label="Confirmar contraseña" type="password" value={form.confirmarContrasena} onChange={(e) => actualizar("confirmarContrasena", e.target.value)} />
      </div>
      <Input
        label="Nombre profesional"
        value={form.nombreProfesional}
        onChange={(e) => actualizar("nombreProfesional", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Años de experiencia"
          min={0}
          type="number"
          value={form.anosExperiencia}
          onChange={(e) => actualizar("anosExperiencia", e.target.value)}
        />
        <Input
          label="Especialidad principal"
          value={form.especialidadPrincipal}
          onChange={(e) => actualizar("especialidadPrincipal", e.target.value)}
        />
      </div>
      <label className="block text-sm font-medium text-neutral-200">
        Biografía
        <textarea
          className="mt-2 min-h-28 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          placeholder="Cuéntanos sobre tu experiencia, estilo de trabajo o especialidad."
          value={form.biografia}
          onChange={(e) => actualizar("biografia", e.target.value)}
        />
      </label>
      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />
      <Button
        className="w-full bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#f5d77b]"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Enviando solicitud..." : "Enviar postulación"}
      </Button>
    </form>
  );
}
