import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tijera Brava",
  description: "Reserva tu corte a domicilio con barberos profesionales"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
