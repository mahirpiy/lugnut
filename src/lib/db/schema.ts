// src/lib/db/schema.ts
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// NextAuth tables
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  zipCode: text("zip_code"),
  password: text("password"), // Added for credentials auth
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Lugnut tables
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(), // one of: "monthly" | "yearly" | "permanent"
  status: text("status").notNull(), // one of: "active" | "expired" | "canceled"
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  expiryDate: timestamp("expiry_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paygUsageCredits = pgTable("payg_usage_credits", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creditType: text("credit_type").notNull(), // one of: "vehicle" | "job" | "fuel" | "odometer"
  purchasedCount: integer("purchased_count").notNull().default(0),
  usedCount: integer("used_count").notNull().default(0),
  purchasedAt: timestamp("purchased_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  licensePlate: text("license_plate"),
  vin: text("vin"),
  nickname: text("nickname"),
  initialOdometer: integer("initial_odometer").notNull(),
  currentOdometer: integer("current_odometer").notNull(),
  registrationExpiration: timestamp("registration_expiration", {
    mode: "date",
  }),
  purchaseDate: timestamp("purchase_date", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const odometerEntries = pgTable("odometer_entries", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  type: text("type").notNull().default("reading"),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  odometer: integer("odometer").notNull(),
  notes: text("notes"),
  entryDate: timestamp("entry_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  odometerId: uuid("odometer_id")
    .notNull()
    .references(() => odometerEntries.id, { onDelete: "cascade" }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0.00"),
  isDiy: boolean("is_diy").default(true),
  difficulty: integer("difficulty").default(0),
  shopName: text("shop_name"),
  notes: text("notes"),
  url: text("url"),
  hours: decimal("hours", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const records = pgTable("records", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parts = pgTable("parts", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  recordId: uuid("record_id")
    .notNull()
    .references(() => records.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  partNumber: text("part_number"),
  manufacturer: text("manufacturer"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  quantity: integer("quantity").notNull().default(1),
  url: text("url"),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recordTags = pgTable(
  "record_tags",
  {
    recordId: uuid("record_id")
      .notNull()
      .references(() => records.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.recordId, table.tagId] }),
  })
);

export const fuelEntries = pgTable("fuel_entries", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  date: timestamp("date", { mode: "date" }).notNull(),
  odometerId: uuid("odometer_id")
    .notNull()
    .references(() => odometerEntries.id, { onDelete: "cascade" }),
  gallons: decimal("gallons", { precision: 8, scale: 3 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  gasStation: text("gas_station"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobPhotos = pgTable("job_photos", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partPhotos = pgTable("part_photos", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceIntervals = pgTable("service_intervals", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mileageInterval: integer("mileage_interval"),
  monthInterval: integer("month_interval"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceIntervalTags = pgTable(
  "service_interval_tags",
  {
    serviceIntervalId: uuid("service_interval_id")
      .notNull()
      .references(() => serviceIntervals.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceIntervalId, table.tagId] }),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  fuelEntries: many(fuelEntries),
  serviceIntervals: many(serviceIntervals),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [jobs.vehicleId],
    references: [vehicles.id],
  }),
  records: many(records),
}));

export const recordsRelations = relations(records, ({ one, many }) => ({
  job: one(jobs, {
    fields: [records.jobId],
    references: [jobs.id],
  }),
  parts: many(parts),
  recordTags: many(recordTags),
}));

export const partsRelations = relations(parts, ({ one }) => ({
  record: one(records, {
    fields: [parts.recordId],
    references: [records.id],
  }),
}));

export const recordTagsRelations = relations(recordTags, ({ one }) => ({
  record: one(records, {
    fields: [recordTags.recordId],
    references: [records.id],
  }),
  tag: one(tags, {
    fields: [recordTags.tagId],
    references: [tags.id],
  }),
}));

export const fuelEntriesRelations = relations(fuelEntries, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [fuelEntries.vehicleId],
    references: [vehicles.id],
  }),
}));

export const serviceIntervalsRelations = relations(
  serviceIntervals,
  ({ one, many }) => ({
    vehicle: one(vehicles, {
      fields: [serviceIntervals.vehicleId],
      references: [vehicles.id],
    }),
    tags: many(serviceIntervalTags),
  })
);

export const serviceIntervalTagsRelations = relations(
  serviceIntervalTags,
  ({ one }) => ({
    serviceInterval: one(serviceIntervals, {
      fields: [serviceIntervalTags.serviceIntervalId],
      references: [serviceIntervals.id],
    }),
    tag: one(tags, {
      fields: [serviceIntervalTags.tagId],
      references: [tags.id],
    }),
  })
);
