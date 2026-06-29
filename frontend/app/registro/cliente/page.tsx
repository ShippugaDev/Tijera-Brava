import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegistroClienteForm } from "@/components/auth/RegistroClienteForm";

export default function RegistroClientePage() {
  return (
    <AuthLayout
      etiqueta="Registro cliente"
      subtitulo="Crea tu cuenta para reservar barberos a domicilio, probar estilos con LookIA y gestionar tus pagos."
      titulo="Crea tu cuenta de cliente"
    >
      <RegistroClienteForm />
      <div className="mt-6 flex flex-col gap-3 text-sm text-[#b5b5b5] sm:flex-row sm:flex-wrap">
        <Link className="text-[#f5d77b] transition hover:text-white" href="/login">
          Ya tengo una cuenta
        </Link>
        <Link className="text-[#f5d77b] transition hover:text-white" href="/registro/barbero">
          Postular como barbero
        </Link>
        <Link className="text-[#b5b5b5] transition hover:text-white" href="/">
          Volver al inicio
        </Link>
      </div>
    </AuthLayout>
  );
}
