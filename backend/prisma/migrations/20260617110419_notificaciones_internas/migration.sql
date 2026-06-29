-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('RESERVA_CREADA', 'RESERVA_ACEPTADA', 'RESERVA_RECHAZADA', 'RESERVA_CANCELADA', 'RESERVA_EN_CAMINO', 'RESERVA_INICIADA', 'RESERVA_FINALIZADA', 'PAGO_COMPROBANTE_SUBIDO', 'PAGO_CONFIRMADO', 'PAGO_CANCELADO', 'PAGO_REEMBOLSADO', 'BARBERO_APROBADO', 'BARBERO_RECHAZADO', 'CALIFICACION_RECIBIDA', 'LOOKIA_COMPLETADA', 'PORTAFOLIO_MODERADO', 'SISTEMA');

-- CreateTable
CREATE TABLE "notificaciones" (
    "id_notificacion" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "enlace_accion" TEXT,
    "metadata" JSONB,
    "fecha_lectura" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateIndex
CREATE INDEX "notificaciones_id_usuario_leida_idx" ON "notificaciones"("id_usuario", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_tipo_idx" ON "notificaciones"("tipo");

-- CreateIndex
CREATE INDEX "notificaciones_fecha_creacion_idx" ON "notificaciones"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
