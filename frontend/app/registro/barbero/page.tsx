import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegistroBarberoForm } from "@/components/auth/RegistroBarberoForm";

export default function RegistroBarberoPage() {
  return (
    <AuthLayout
      etiqueta="Postulación barbero"
      subtitulo="Envía tu perfil profesional para que administración revise tu solicitud y puedas atender reservas."
      titulo="Postula como barbero"
    >
      <RegistroBarberoForm />
      <div className="mt-6 flex flex-col gap-3 text-sm text-[#b5b5b5] sm:flex-row sm:flex-wrap">
        <Link className="text-[#f5d77b] transition hover:text-white" href="/login">
          Ya tengo una cuenta
        </Link>
        <Link className="text-[#f5d77b] transition hover:text-white" href="/registro/cliente">
          Registrarme como cliente
        </Link>
        <Link className="text-[#b5b5b5] transition hover:text-white" href="/">
          Volver al inicio
        </Link>
      </div>
    </AuthLayout>
  );
}
