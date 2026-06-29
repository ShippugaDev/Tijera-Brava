-- CreateEnum
CREATE TYPE "EstadoVisibilidadPortafolio" AS ENUM ('VISIBLE', 'OCULTO', 'ELIMINADO');

-- CreateTable
CREATE TABLE "categorias_cortes" (
    "id_categoria_corte" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_cortes_pkey" PRIMARY KEY ("id_categoria_corte")
);

-- CreateTable
CREATE TABLE "portafolios_cortes" (
    "id_portafolio_corte" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "id_categoria_corte" UUID,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_url" TEXT NOT NULL,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "estado_visibilidad" "EstadoVisibilidadPortafolio" NOT NULL DEFAULT 'VISIBLE',
    "motivo_moderacion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portafolios_cortes_pkey" PRIMARY KEY ("id_portafolio_corte")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_cortes_slug_key" ON "categorias_cortes"("slug");

-- CreateIndex
CREATE INDEX "portafolios_cortes_id_barbero_idx" ON "portafolios_cortes"("id_barbero");

-- CreateIndex
CREATE INDEX "portafolios_cortes_id_categoria_corte_idx" ON "portafolios_cortes"("id_categoria_corte");

-- CreateIndex
CREATE INDEX "portafolios_cortes_estado_visibilidad_idx" ON "portafolios_cortes"("estado_visibilidad");

-- AddForeignKey
ALTER TABLE "portafolios_cortes" ADD CONSTRAINT "portafolios_cortes_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portafolios_cortes" ADD CONSTRAINT "portafolios_cortes_id_categoria_corte_fkey" FOREIGN KEY ("id_categoria_corte") REFERENCES "categorias_cortes"("id_categoria_corte") ON DELETE SET NULL ON UPDATE CASCADE;
