-- ═══════════════════════════════════════════════════════════════
-- Migración 001 — Sistema de Vehículos Destacados (Fase 1)
-- SOLO ADITIVA: crea enums, tablas, constraints e índices nuevos.
-- No modifica ni borra ninguna tabla existente.
-- Se ejecuta dentro de una transacción (todo o nada).
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE "public"."estado_destacado" AS ENUM('activo', 'expirado');
CREATE TYPE "public"."estado_pago" AS ENUM('pendiente', 'aprobado', 'rechazado', 'expirado');
CREATE TYPE "public"."origen_destacado" AS ENUM('pago', 'cortesia_admin');
CREATE TYPE "public"."tipo_pago" AS ENUM('destacado', 'comision_venta');

CREATE TABLE "planes_destacado" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(60) NOT NULL,
	"duracion_dias" integer NOT NULL,
	"precio" integer NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "planes_destacado_nombre_unique" UNIQUE("nombre"),
	CONSTRAINT "plan_duracion_valida" CHECK ("planes_destacado"."duracion_dias" BETWEEN 1 AND 365),
	CONSTRAINT "plan_precio_valido" CHECK ("planes_destacado"."precio" > 0)
);

CREATE TABLE "pagos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referencia_unica" varchar(80) NOT NULL,
	"usuario_id" integer NOT NULL,
	"vehiculo_id" integer,
	"plan_id" integer,
	"tipo" "tipo_pago" NOT NULL,
	"monto" integer NOT NULL,
	"duracion_dias_compra" integer,
	"estado" "estado_pago" DEFAULT 'pendiente' NOT NULL,
	"id_transaccion_wompi" varchar(64),
	"metodo_pago" varchar(30),
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"aprobado_en" timestamp with time zone,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pagos_referencia_unica_unique" UNIQUE("referencia_unica"),
	CONSTRAINT "pagos_id_transaccion_wompi_unique" UNIQUE("id_transaccion_wompi"),
	CONSTRAINT "pago_monto_valido" CHECK ("pagos"."monto" > 0),
	CONSTRAINT "pago_destacado_con_plan" CHECK ("pagos"."tipo" <> 'destacado' OR ("pagos"."plan_id" IS NOT NULL AND "pagos"."duracion_dias_compra" > 0)),
	CONSTRAINT "pago_aprobado_con_fecha" CHECK ("pagos"."estado" <> 'aprobado' OR "pagos"."aprobado_en" IS NOT NULL)
);

CREATE TABLE "destacados_activos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehiculo_id" integer NOT NULL,
	"pago_id" uuid,
	"plan_id" integer,
	"origen" "origen_destacado" DEFAULT 'pago' NOT NULL,
	"inicia_en" timestamp with time zone NOT NULL,
	"termina_en" timestamp with time zone NOT NULL,
	"estado" "estado_destacado" DEFAULT 'activo' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destacados_activos_pago_id_unique" UNIQUE("pago_id"),
	CONSTRAINT "dest_rango_valido" CHECK ("destacados_activos"."termina_en" > "destacados_activos"."inicia_en"),
	CONSTRAINT "dest_pago_si_origen_pago" CHECK ("destacados_activos"."origen" <> 'pago' OR ("destacados_activos"."pago_id" IS NOT NULL AND "destacados_activos"."plan_id" IS NOT NULL))
);

CREATE TABLE "eventos_pago" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pago_id" uuid,
	"referencia" varchar(80),
	"origen" varchar(20) NOT NULL,
	"evento" varchar(40) NOT NULL,
	"estado_wompi" varchar(20),
	"firma_valida" boolean,
	"ip" varchar(45),
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_vehiculo_id_vehicles_id_fk" FOREIGN KEY ("vehiculo_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_plan_id_planes_destacado_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."planes_destacado"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "destacados_activos" ADD CONSTRAINT "destacados_activos_vehiculo_id_vehicles_id_fk" FOREIGN KEY ("vehiculo_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "destacados_activos" ADD CONSTRAINT "destacados_activos_pago_id_pagos_id_fk" FOREIGN KEY ("pago_id") REFERENCES "public"."pagos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "destacados_activos" ADD CONSTRAINT "destacados_activos_plan_id_planes_destacado_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."planes_destacado"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "eventos_pago" ADD CONSTRAINT "eventos_pago_pago_id_pagos_id_fk" FOREIGN KEY ("pago_id") REFERENCES "public"."pagos"("id") ON DELETE set null ON UPDATE no action;

CREATE INDEX "pagos_usuario_idx" ON "pagos" USING btree ("usuario_id","creado_en");
CREATE INDEX "pagos_vehiculo_idx" ON "pagos" USING btree ("vehiculo_id");
CREATE INDEX "pagos_estado_creado_idx" ON "pagos" USING btree ("estado","creado_en");
CREATE INDEX "dest_vehiculo_termina_idx" ON "destacados_activos" USING btree ("vehiculo_id","termina_en");
CREATE INDEX "dest_termina_idx" ON "destacados_activos" USING btree ("termina_en");
CREATE INDEX "eventos_ref_idx" ON "eventos_pago" USING btree ("referencia");
CREATE INDEX "eventos_creado_idx" ON "eventos_pago" USING btree ("creado_en");
