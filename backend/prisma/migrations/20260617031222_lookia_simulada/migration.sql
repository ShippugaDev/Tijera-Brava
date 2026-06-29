-- CreateEnum
CREATE TYPE "EstadoSimulacionLookIA" AS ENUM ('PROCESANDO', 'COMPLETADA', 'FALLIDA', 'ELIMINADA');

-- CreateTable
CREATE TABLE "estilos_lookia" (
    "id_estilo_lookia" UUID NOT NULL,
    "id_categoria_corte" UUID,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "prompt_base" TEXT,
    "imagen_referencia_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estilos_lookia_pkey" PRIMARY KEY ("id_estilo_lookia")
);

-- CreateTable
CREATE TABLE "simulaciones_lookia" (
    "id_simulacion_lookia" UUID NOT NULL,
    "id_cliente" UUID NOT NULL,
    "id_estilo_lookia" UUID NOT NULL,
    "imagen_original_url" TEXT NOT NULL,
    "imagen_resultado_url" TEXT,
    "estado_simulacion" "EstadoSimulacionLookIA" NOT NULL DEFAULT 'PROCESANDO',
    "consentimiento_aceptado" BOOLEAN NOT NULL DEFAULT false,
    "mensaje_error" TEXT,
    "fecha_procesamiento" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulaciones_lookia_pkey" PRIMARY KEY ("id_simulacion_lookia")
);

-- CreateIndex
CREATE UNIQUE INDEX "estilos_lookia_slug_key" ON "estilos_lookia"("slug");

-- CreateIndex
CREATE INDEX "estilos_lookia_id_categoria_corte_idx" ON "estilos_lookia"("id_categoria_corte");

-- CreateIndex
CREATE INDEX "simulaciones_lookia_id_cliente_idx" ON "simulaciones_lookia"("id_cliente");

-- CreateIndex
CREATE INDEX "simulaciones_lookia_id_estilo_lookia_idx" ON "simulaciones_lookia"("id_estilo_lookia");

-- CreateIndex
CREATE INDEX "simulaciones_lookia_estado_simulacion_idx" ON "simulaciones_lookia"("estado_simulacion");

-- AddForeignKey
ALTER TABLE "estilos_lookia" ADD CONSTRAINT "estilos_lookia_id_categoria_corte_fkey" FOREIGN KEY ("id_categoria_corte") REFERENCES "categorias_cortes"("id_categoria_corte") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulaciones_lookia" ADD CONSTRAINT "simulaciones_lookia_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulaciones_lookia" ADD CONSTRAINT "simulaciones_lookia_id_estilo_lookia_fkey" FOREIGN KEY ("id_estilo_lookia") REFERENCES "estilos_lookia"("id_estilo_lookia") ON DELETE RESTRICT ON UPDATE CASCADE;
