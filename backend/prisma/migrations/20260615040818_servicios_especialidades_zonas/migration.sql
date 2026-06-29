-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "servicios_barberos" (
    "id_servicio_barbero" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "id_servicio" UUID NOT NULL,
    "precio_personalizado" DECIMAL(10,2),
    "duracion_personalizada" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_barberos_pkey" PRIMARY KEY ("id_servicio_barbero")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id_especialidad" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id_especialidad")
);

-- CreateTable
CREATE TABLE "especialidades_barberos" (
    "id_especialidad_barbero" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "id_especialidad" UUID NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especialidades_barberos_pkey" PRIMARY KEY ("id_especialidad_barbero")
);

-- CreateTable
CREATE TABLE "zonas_cobertura" (
    "id_zona_cobertura" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "provincia" TEXT NOT NULL DEFAULT 'Lima',
    "departamento" TEXT NOT NULL DEFAULT 'Lima',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_cobertura_pkey" PRIMARY KEY ("id_zona_cobertura")
);

-- CreateTable
CREATE TABLE "zonas_barberos" (
    "id_zona_barbero" UUID NOT NULL,
    "id_barbero" UUID NOT NULL,
    "id_zona_cobertura" UUID NOT NULL,
    "costo_traslado" DECIMAL(10,2),
    "tiempo_traslado_minutos" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_barberos_pkey" PRIMARY KEY ("id_zona_barbero")
);

-- CreateIndex
CREATE UNIQUE INDEX "servicios_slug_key" ON "servicios"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_barberos_id_barbero_id_servicio_key" ON "servicios_barberos"("id_barbero", "id_servicio");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_slug_key" ON "especialidades"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_barberos_id_barbero_id_especialidad_key" ON "especialidades_barberos"("id_barbero", "id_especialidad");

-- CreateIndex
CREATE UNIQUE INDEX "zonas_cobertura_slug_key" ON "zonas_cobertura"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "zonas_barberos_id_barbero_id_zona_cobertura_key" ON "zonas_barberos"("id_barbero", "id_zona_cobertura");

-- AddForeignKey
ALTER TABLE "servicios_barberos" ADD CONSTRAINT "servicios_barberos_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios_barberos" ADD CONSTRAINT "servicios_barberos_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "especialidades_barberos" ADD CONSTRAINT "especialidades_barberos_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "especialidades_barberos" ADD CONSTRAINT "especialidades_barberos_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidades"("id_especialidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zonas_barberos" ADD CONSTRAINT "zonas_barberos_id_barbero_fkey" FOREIGN KEY ("id_barbero") REFERENCES "barberos"("id_barbero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zonas_barberos" ADD CONSTRAINT "zonas_barberos_id_zona_cobertura_fkey" FOREIGN KEY ("id_zona_cobertura") REFERENCES "zonas_cobertura"("id_zona_cobertura") ON DELETE RESTRICT ON UPDATE CASCADE;
