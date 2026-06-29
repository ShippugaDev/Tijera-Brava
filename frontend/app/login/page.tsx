import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      etiqueta="Acceso seguro"
      subtitulo="Accede a tu cuenta y gestiona tus reservas, servicios o panel administrativo."
      titulo="Inicia sesión"
    >
      <LoginForm />
      <div className="mt-6 grid gap-3 text-sm text-[#b5b5b5]">
        <Link className="text-[#f5d77b] transition hover:text-white" href="/registro/cliente">
          ¿No tienes cuenta? Regístrate como cliente
        </Link>
        <Link className="text-[#f5d77b] transition hover:text-white" href="/registro/barbero">
          ¿Eres barbero? Postula aquí
        </Link>
        <Link className="text-[#b5b5b5] transition hover:text-white" href="/">
          Volver al inicio
        </Link>
      </div>
    </AuthLayout>
  );
}
