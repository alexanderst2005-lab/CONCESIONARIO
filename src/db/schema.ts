import { pgTable, serial, text, integer, boolean, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
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
