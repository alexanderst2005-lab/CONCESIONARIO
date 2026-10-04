import { pgTable, serial, text, integer, boolean, timestamp, primaryKey, index, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  
  price: integer('price').notNull(), // Precio comercial
  
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
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id),
  bankId: integer('bank_id').notNull().references(() => banks.id),
  
  personalData: jsonb('personal_data').notNull(),
  laborData: jsonb('labor_data').notNull(),
  financialData: jsonb('financial_data').notNull(),
  
  vehiclePrice: integer('vehicle_price').notNull(),
  downPayment: integer('down_payment').notNull(),
  financedAmount: integer('financed_amount').notNull(),
  term: integer('term').notNull(),
  rate: text('rate').notNull(),
  estimatedMonthly: integer('estimated_monthly').notNull(),
  
  status: text('status').notNull().default('Pendiente'),
  
  idDocumentUrl: text('id_document_url'),
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
