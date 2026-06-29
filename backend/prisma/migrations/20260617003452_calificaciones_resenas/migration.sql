-- CreateEnum
CREATE TYPE "EstadoVisibilidadCalificacion" AS ENUM ('VISIBLE', 'OCULTA');

-- CreateTable
CREATE TABLE "calificaciones" (
    "id_calificacion" UUID NOT NULL,
    "id_reserva" UUID NOT NULL,
    "id_cliente" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "estado_visibilidad" "EstadoVisibilidadCalificacion" NOT NULL DEFAULT 'VISIBLE',
    "motivo_moderacion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id_calificacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_id_reserva_key" ON "calificaciones"("id_reserva");

-- CreateIndex
CREATE INDEX "calificaciones_id_cliente_idx" ON "calificaciones"("id_cliente");

-- CreateIndex
CREATE INDEX "calificaciones_id_barbero_idx" ON "calificaciones"("id_barbero");

-- CreateIndex
CREATE INDEX "calificaciones_estado_visibilidad_idx" ON "calificaciones"("estado_visibilidad");

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;
