-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'COMPROBANTE_SUBIDO', 'CONFIRMADO', 'CANCELADO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" UUID NOT NULL,
    "id_reserva" UUID NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "monto_servicio" DECIMAL(10,2) NOT NULL,
    "monto_traslado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "comprobante_url" TEXT,
    "codigo_operacion" TEXT,
    "observacion" TEXT,
    "fecha_confirmacion" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "historial_estados_pago" (
    "id_historial_estado_pago" UUID NOT NULL,
    "id_pago" UUID NOT NULL,
    "estado_anterior" "EstadoPago",
    "estado_nuevo" "EstadoPago" NOT NULL,
    "id_usuario_responsable" UUID,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pago_pkey" PRIMARY KEY ("id_historial_estado_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagos_id_reserva_key" ON "pagos"("id_reserva");

-- CreateIndex
CREATE INDEX "pagos_estado_pago_idx" ON "pagos"("estado_pago");

-- CreateIndex
CREATE INDEX "historial_estados_pago_id_pago_idx" ON "historial_estados_pago"("id_pago");

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pago" ADD CONSTRAINT "historial_estados_pago_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pago" ADD CONSTRAINT "historial_estados_pago_id_usuario_responsable_fkey" FOREIGN KEY ("id_usuario_responsable") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
