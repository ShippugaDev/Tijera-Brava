-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "horarios_disponibilidad" (
    "id_horario_disponibilidad" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_disponibilidad_pkey" PRIMARY KEY ("id_horario_disponibilidad")
);

-- CreateTable
CREATE TABLE "bloqueos_horarios" (
    "id_bloqueo_horario" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloqueos_horarios_pkey" PRIMARY KEY ("id_bloqueo_horario")
);

-- CreateIndex
CREATE INDEX "horarios_disponibilidad_id_barbero_dia_semana_idx" ON "horarios_disponibilidad"("id_barbero", "dia_semana");

-- CreateIndex
CREATE INDEX "bloqueos_horarios_id_barbero_fecha_inicio_fecha_fin_idx" ON "bloqueos_horarios"("id_barbero", "fecha_inicio", "fecha_fin");

-- AddForeignKey
ALTER TABLE "horarios_disponibilidad" ADD CONSTRAINT "horarios_disponibilidad_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueos_horarios" ADD CONSTRAINT "bloqueos_horarios_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;
