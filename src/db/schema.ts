import { pgTable, pgEnum, serial, uuid, varchar, text, integer, bigint, boolean, timestamp, primaryKey, index, jsonb, check } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Usuarios
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  birthDate: timestamp('birth_date'),
  city: text('city'),
  password: text('password').notNull(),
  role: text('role').notNull().default('USER'), // 'USER' o 'ADMIN'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Categorías
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  subtypes: text('subtypes').default('[]').notNull(),
  brandsList: text('brands_list').default('[]').notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
});

// Marcas
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Modelos
export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Vehículos
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  brandId: integer('brand_id').notNull().references(() => brands.id),
  modelId: integer('model_id').notNull().references(() => models.id),
  
  version: text('version').notNull(),
  year: integer('year').notNull(),
  mileage: integer('mileage').notNull(),
  engineCapacity: integer('engine_capacity'), // Cilindraje
  transmission: text('transmission').notNull(), // Mecánica, Automática
  fuelType: text('fuel_type').notNull(), // Gasolina, Diésel, etc.
  
  // Documentación
  soat: boolean('soat').default(true),
  soatExpiration: timestamp('soat_expiration'),
  tecnomecanica: boolean('tecnomecanica').default(true),
  tecnomecanicaExpiration: timestamp('tecnomecanica_expiration'),
  ownersCount: integer('owners_count'),
  prenda: boolean('prenda').default(false),
  plate: text('plate'), // Oculto públicamente
  cityRegistered: text('city_registered'), // Matriculado en
  color: text('color'),

    accessories: text('accessories'),
    hasGas: boolean('has_gas').default(false),
    hasGps: boolean('has_gps').default(false),
    locationStatus: text('location_status').default('Cita'),
    contactPhone: text('contact_phone'), // WhatsApp de contacto del vendedor para este vehículo
  
  price: bigint('price', { mode: 'number' }).notNull(), // Precio comercial
  
  // Ubicación
  city: text('city').notNull(),
  department: text('department'),
  
  description: text('description'),
  status: text('status').notNull().default('PENDIENTE'), // PENDIENTE, ACTIVO, RECHAZADO, PAUSADO, VENDIDO, OCULTO
  rejectionReason: text('rejection_reason'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPromoted: boolean('is_promoted').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  isDealerVehicle: boolean('is_dealer_vehicle').default(false).notNull(), // Permite distinguir inventario del concesionario
}, (t) => ({
  brandIdx: index('brand_idx').on(t.brandId),
  modelIdx: index('model_idx').on(t.modelId),
  categoryIdx: index('category_idx').on(t.categoryId),
  priceIdx: index('price_idx').on(t.price),
  yearIdx: index('year_idx').on(t.year),
  mileageIdx: index('mileage_idx').on(t.mileage),
  cityIdx: index('city_idx').on(t.city),
  fuelIdx: index('fuel_idx').on(t.fuelType),
  transmissionIdx: index('transmission_idx').on(t.transmission),
  statusIdx: index('status_idx').on(t.status),
}));

// Imágenes de Vehículos
export const vehicleImages = pgTable('vehicle_images', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  isMain: boolean('is_main').default(false).notNull(),
  order: integer('order').default(0).notNull(),
});

// Características (Maestro)
export const features = pgTable('features', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // ej. "Cojinería en cuero", "Aire acondicionado"
});

// Características por Vehículo (Muchos a Muchos)
export const vehicleFeatures = pgTable('vehicle_features', {
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  featureId: integer('feature_id').notNull().references(() => features.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.vehicleId, t.featureId] })
}));

// Favoritos
export const favorites = pgTable('favorites', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.vehicleId] })
}));

// Leads / Interesados
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  channel: text('channel').notNull().default('WhatsApp'),
  
  status: text('status').notNull().default('Nuevo'), // Nuevo, Contactado, En negociación, Vendido, Cerrado
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Configuraciones del Administrador
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  whatsappNumber: text('whatsapp_number'),
  defaultMessage: text('default_message'),
  minDownPaymentPercentage: integer('min_down_payment_percentage').default(10),
  maxDownPaymentPercentage: integer('max_down_payment_percentage').default(70),
  downPaymentStep: integer('down_payment_step').default(5),
  financingNotificationEmail: text('financing_notification_email'),
});

// Relaciones Drizzle (Opcional, para facilitar consultas con db.query)
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  favorites: many(favorites),
  leadsReceived: many(leads, { relationName: 'sellerLeads' })
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, { fields: [vehicles.userId], references: [users.id] }),
  brand: one(brands, { fields: [vehicles.brandId], references: [brands.id] }),
  model: one(models, { fields: [vehicles.modelId], references: [models.id] }),
  category: one(categories, { fields: [vehicles.categoryId], references: [categories.id] }),
  images: many(vehicleImages),
  features: many(vehicleFeatures),
  favorites: many(favorites),
  leads: many(leads)
}));

export const vehicleFeaturesRelations = relations(vehicleFeatures, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleFeatures.vehicleId], references: [vehicles.id] }),
  feature: one(features, { fields: [vehicleFeatures.featureId], references: [features.id] }),
}));

export const featuresRelations = relations(features, ({ many }) => ({
  vehicles: many(vehicleFeatures),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleImages.vehicleId], references: [vehicles.id] }),
}));

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bancos / Entidades Financieras
export const banks = pgTable('banks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  rate: text('rate').notNull(), // String for flexibility like "1.5"
  terms: jsonb('terms').default('[]').notNull(), // [12, 24, 36, 48, 60]
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Solicitudes de Financiación
export const financingRequests = pgTable('financing_requests', {
  id: serial('id').primaryKey(),
  requestNumber: text('request_number').notNull().unique(), // SOL-2026-000124
  userId: integer('user_id').notNull().references(() => users.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  bankId: integer('bank_id').references(() => banks.id),
  
  tipoSolicitud: text('tipo_solicitud').default('vehiculo').notNull(),
  rangoMin: bigint('rango_min', { mode: 'number' }),
  rangoMax: bigint('rango_max', { mode: 'number' }),
  
  personalData: jsonb('personal_data').notNull(),
  laborData: jsonb('labor_data').notNull(),
  financialData: jsonb('financial_data').notNull(),
  
  vehiclePrice: bigint('vehicle_price', { mode: 'number' }).notNull(),
  downPayment: bigint('down_payment', { mode: 'number' }).notNull(),
  financedAmount: bigint('financed_amount', { mode: 'number' }).notNull(),
  term: integer('term').notNull(),
  rate: text('rate').notNull(),
  estimatedMonthly: bigint('estimated_monthly', { mode: 'number' }).notNull(),
  
  status: text('status').notNull().default('Pendiente'),
  
  idDocumentUrl: text('id_document_url'),
  signatureUrl: text('signature_url'),
  pdfUrl: text('pdf_url'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const banksRelations = relations(banks, ({ many }) => ({
  financingRequests: many(financingRequests),
}));

export const financingRequestsRelations = relations(financingRequests, ({ one }) => ({
  user: one(users, { fields: [financingRequests.userId], references: [users.id] }),
  vehicle: one(vehicles, { fields: [financingRequests.vehicleId], references: [vehicles.id] }),
  bank: one(banks, { fields: [financingRequests.bankId], references: [banks.id] }),
}));

// Planes de Promoción (Destacado)
export const promotionPlans = pgTable('promotion_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // Precio mensual en COP
  interval: text('interval').notNull().default('month'), // 'month', 'year', etc.
  duration: integer('duration').default(30).notNull(), // Duración numérica (ej: 30)
  durationUnit: text('duration_unit').default('días').notNull(), // 'días', 'semanas', 'meses'
  benefits: jsonb('benefits').default('[]').notNull(), // ["Vehículo destacado", "Mayor visibilidad"]
  autoRenew: boolean('auto_renew').default(true).notNull(), // Renovable o no
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Suscripciones de Vehículos
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => promotionPlans.id),
  
  status: text('status').notNull().default('pending'), // pending, active, past_due, canceled, suspended, expired
  amount: integer('amount').notNull(),
  
  startDate: timestamp('start_date'),
  nextBillingDate: timestamp('next_billing_date'),
  lastPaymentDate: timestamp('last_payment_date'),
  cancelledAt: timestamp('cancelled_at'),
  currentPeriodEnd: timestamp('current_period_end'),
  
  wompiPaymentSourceId: text('wompi_payment_source_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pagos de Suscripciones (Historial de transacciones e intentos)
export const subscriptionPayments = pgTable('subscription_payments', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').references(() => promotionPlans.id),
  amount: integer('amount').notNull(),
  transactionId: text('transaction_id'),
  reference: text('reference').notNull().unique(), // Referencia única del cobro
  status: text('status').notNull(), // PENDING, APPROVED, DECLINED, ERROR, EXPIRED, FAILED
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promotionPlansRelations = relations(promotionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  vehicle: one(vehicles, { fields: [subscriptions.vehicleId], references: [vehicles.id] }),
  plan: one(promotionPlans, { fields: [subscriptions.planId], references: [promotionPlans.id] }),
  payments: many(subscriptionPayments),
}));

export const subscriptionPaymentsRelations = relations(subscriptionPayments, ({ one }) => ({
  subscription: one(subscriptions, { fields: [subscriptionPayments.subscriptionId], references: [subscriptions.id] }),
}));

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE VEHÍCULOS DESTACADOS (prepago + extensión) — Fase 1
// Regla: el estado "destacado" NUNCA se guarda como booleano.
// Se calcula: EXISTS destacados_activos WHERE termina_en > NOW().
// ═══════════════════════════════════════════════════════════════

export const tipoPagoEnum = pgEnum('tipo_pago', ['destacado', 'comision_venta']);
export const estadoPagoEnum = pgEnum('estado_pago', ['pendiente', 'aprobado', 'rechazado', 'expirado']);
export const estadoDestacadoEnum = pgEnum('estado_destacado', ['activo', 'expirado']);
export const origenDestacadoEnum = pgEnum('origen_destacado', ['pago', 'cortesia_admin']);

// timestamptz: evita errores de zona horaria al comparar contra NOW()
const tz = { withTimezone: true } as const;

// Planes editables desde BD / panel admin (nunca hardcodeados)
export const planesDestacado = pgTable('planes_destacado', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 60 }).notNull().unique(),
  duracionDias: integer('duracion_dias').notNull(),
  precio: integer('precio').notNull(), // COP enteros (ej. 25000)
  activo: boolean('activo').default(true).notNull(),
  creadoEn: timestamp('creado_en', tz).defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en', tz).defaultNow().notNull(),
}, (t) => [
  check('plan_duracion_valida', sql`${t.duracionDias} BETWEEN 1 AND 365`),
  check('plan_precio_valido', sql`${t.precio} > 0`),
]);

// Pagos (destacado hoy; comisión de venta a futuro)
export const pagos = pgTable('pagos', {
  id: uuid('id').defaultRandom().primaryKey(), // no secuencial
  referenciaUnica: varchar('referencia_unica', { length: 80 }).notNull().unique(),
  usuarioId: integer('usuario_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  vehiculoId: integer('vehiculo_id').references(() => vehicles.id, { onDelete: 'set null' }),
  planId: integer('plan_id').references(() => planesDestacado.id, { onDelete: 'restrict' }),
  tipo: tipoPagoEnum('tipo').notNull(),
  monto: integer('monto').notNull(), // COP enteros; a Wompi se envía monto * 100
  duracionDiasCompra: integer('duracion_dias_compra'), // snapshot del plan al crear el pago
  estado: estadoPagoEnum('estado').default('pendiente').notNull(),
  idTransaccionWompi: varchar('id_transaccion_wompi', { length: 64 }).unique(),
  metodoPago: varchar('metodo_pago', { length: 30 }), // solo el tipo (CARD/PSE/NEQUI), nunca datos bancarios
  creadoEn: timestamp('creado_en', tz).defaultNow().notNull(),
  aprobadoEn: timestamp('aprobado_en', tz),
  actualizadoEn: timestamp('actualizado_en', tz).defaultNow().notNull(),
}, (t) => [
  index('pagos_usuario_idx').on(t.usuarioId, t.creadoEn),
  index('pagos_vehiculo_idx').on(t.vehiculoId),
  index('pagos_estado_creado_idx').on(t.estado, t.creadoEn),
  check('pago_monto_valido', sql`${t.monto} > 0`),
  check('pago_destacado_con_plan', sql`${t.tipo} <> 'destacado' OR (${t.planId} IS NOT NULL AND ${t.duracionDiasCompra} > 0)`),
  check('pago_aprobado_con_fecha', sql`${t.estado} <> 'aprobado' OR ${t.aprobadoEn} IS NOT NULL`),
]);

// Periodos de destacado (consecutivos, nunca superpuestos)
export const destacadosActivos = pgTable('destacados_activos', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehiculoId: integer('vehiculo_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  pagoId: uuid('pago_id').unique().references(() => pagos.id, { onDelete: 'restrict' }), // UNIQUE = un pago activa una sola vez
  planId: integer('plan_id').references(() => planesDestacado.id, { onDelete: 'restrict' }),
  origen: origenDestacadoEnum('origen').default('pago').notNull(),
  iniciaEn: timestamp('inicia_en', tz).notNull(),
  terminaEn: timestamp('termina_en', tz).notNull(),
  estado: estadoDestacadoEnum('estado').default('activo').notNull(),
  creadoEn: timestamp('creado_en', tz).defaultNow().notNull(),
}, (t) => [
  index('dest_vehiculo_termina_idx').on(t.vehiculoId, t.terminaEn),
  index('dest_termina_idx').on(t.terminaEn),
  check('dest_rango_valido', sql`${t.terminaEn} > ${t.iniciaEn}`),
  check('dest_pago_si_origen_pago', sql`${t.origen} <> 'pago' OR (${t.pagoId} IS NOT NULL AND ${t.planId} IS NOT NULL)`),
]);

// Auditoría de eventos de pago (webhooks, retornos, cron, intentos sospechosos)
// Nunca guardar payloads completos ni datos de tarjeta.
export const eventosPago = pgTable('eventos_pago', {
  id: uuid('id').defaultRandom().primaryKey(),
  pagoId: uuid('pago_id').references(() => pagos.id, { onDelete: 'set null' }),
  referencia: varchar('referencia', { length: 80 }),
  origen: varchar('origen', { length: 20 }).notNull(), // 'webhook' | 'retorno' | 'cron'
  evento: varchar('evento', { length: 40 }).notNull(), // 'firma_invalida', 'aprobado', 'monto_no_coincide', ...
  estadoWompi: varchar('estado_wompi', { length: 20 }),
  firmaValida: boolean('firma_valida'),
  ip: varchar('ip', { length: 45 }),
  creadoEn: timestamp('creado_en', tz).defaultNow().notNull(),
}, (t) => [
  index('eventos_ref_idx').on(t.referencia),
  index('eventos_creado_idx').on(t.creadoEn),
]);

export const planesDestacadoRelations = relations(planesDestacado, ({ many }) => ({
  pagos: many(pagos),
  destacados: many(destacadosActivos),
}));

export const pagosRelations = relations(pagos, ({ one, many }) => ({
  usuario: one(users, { fields: [pagos.usuarioId], references: [users.id] }),
  vehiculo: one(vehicles, { fields: [pagos.vehiculoId], references: [vehicles.id] }),
  plan: one(planesDestacado, { fields: [pagos.planId], references: [planesDestacado.id] }),
  destacado: one(destacadosActivos),
  eventos: many(eventosPago),
}));

export const destacadosActivosRelations = relations(destacadosActivos, ({ one }) => ({
  vehiculo: one(vehicles, { fields: [destacadosActivos.vehiculoId], references: [vehicles.id] }),
  pago: one(pagos, { fields: [destacadosActivos.pagoId], references: [pagos.id] }),
  plan: one(planesDestacado, { fields: [destacadosActivos.planId], references: [planesDestacado.id] }),
}));

export const eventosPagoRelations = relations(eventosPago, ({ one }) => ({
  pago: one(pagos, { fields: [eventosPago.pagoId], references: [pagos.id] }),
}));
