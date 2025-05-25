// src/lib/db/schema.ts
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// NextAuth tables
export const users = pgTable("user", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // Added for credentials auth
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: serial("userId")
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
  userId: serial("userId")
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
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  userId: serial("user_id")
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

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  vehicleId: serial("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  odometer: integer("odometer").notNull(),
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
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  jobId: serial("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  recordId: serial("record_id")
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
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recordTags = pgTable(
  "record_tags",
  {
    recordId: serial("record_id")
      .notNull()
      .references(() => records.id, { onDelete: "cascade" }),
    tagId: serial("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.recordId, table.tagId] }),
  })
);

export const fuelEntries = pgTable("fuel_entries", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().unique().notNull(),
  vehicleId: serial("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  date: timestamp("date", { mode: "date" }).notNull(),
  odometer: integer("odometer").notNull(),
  gallons: decimal("gallons", { precision: 8, scale: 3 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  gasStation: text("gas_station"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  customTags: many(tags),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  fuelEntries: many(fuelEntries),
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
