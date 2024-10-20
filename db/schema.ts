// write schema here

import { AVAILABLE_STATUSES } from "../constants";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export type Status = (typeof AVAILABLE_STATUSES)[number]["id"];

const statuses = AVAILABLE_STATUSES.map((status) => status.id);

export const statusEnum = pgEnum(
  "status",
  statuses as [Status, ...Array<Status>]
);

export const Invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => Customers.id),
  value: integer("value").notNull(),
  description: text("description").notNull(),
  status: statusEnum("status").notNull().default("pending"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  organizationId: varchar("organization_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const Customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  organizationId: varchar("organization_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
