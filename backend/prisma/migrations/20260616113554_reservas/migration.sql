-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_CAMINO', 'EN_SERVICIO', 'FINALIZADA', 'CANCELADA_CLIENTE', 'CANCELADA_BARBERO', 'CANCELADA_ADMINISTRACION', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "reservas" (
    "id_reserva" UUID NOT NULL,
    "id_cliente" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "id_servicio" UUID NOT NULL,
    "id_direccion" UUID,
    "id_zona_cobertura" UUID NOT NULL,
    "fecha_reserva" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "estado_reserva" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "metodo_pago" "MetodoPago" NOT NULL,
    "precio_servicio" DECIMAL(10,2) NOT NULL,
    "costo_traslado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "indicaciones_cliente" TEXT,
    "motivo_cancelacion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateTable
CREATE TABLE "historial_estados_reserva" (
    "id_historial_estado_reserva" UUID NOT NULL,
    "id_reserva" UUID NOT NULL,
    "estado_anterior" "EstadoReserva",
    "estado_nuevo" "EstadoReserva" NOT NULL,
    "id_usuario_responsable" UUID,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_reserva_pkey" PRIMARY KEY ("id_historial_estado_reserva")
);

-- CreateIndex
CREATE INDEX "reservas_id_cliente_fecha_reserva_idx" ON "reservas"("id_cliente", "fecha_reserva");

-- CreateIndex
CREATE INDEX "reservas_id_barbero_fecha_reserva_idx" ON "reservas"("id_barbero", "fecha_reserva");

-- CreateIndex
CREATE INDEX "reservas_estado_reserva_idx" ON "reservas"("estado_reserva");

-- CreateIndex
CREATE INDEX "historial_estados_reserva_id_reserva_idx" ON "historial_estados_reserva"("id_reserva");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_zona_cobertura_fkey" FOREIGN KEY ("id_zona_cobertura") REFERENCES "zonas_cobertura"("id_zona_cobertura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_reserva" ADD CONSTRAINT "historial_estados_reserva_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_reserva" ADD CONSTRAINT "historial_estados_reserva_id_usuario_responsable_fkey" FOREIGN KEY ("id_usuario_responsable") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
