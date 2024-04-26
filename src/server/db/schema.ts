import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";

const id = () => text("id").notNull().primaryKey().$defaultFn(randomUUID);
const createdAt = () =>
  timestamp("createdAt", { mode: "string" }).notNull().defaultNow();
const deletedAt = () => timestamp("deletedAt", { mode: "string" });

export const users = pgTable("user", {
  id: id(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export type TUser = typeof users.$inferSelect;

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type().notNull(),
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
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
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
  }),
);

export const products = pgTable("products", {
  id: id(),

  // info
  name: text("name").notNull(),
  price: real("price").notNull(),
  description: text("description"),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TProduct = typeof products.$inferSelect;
export type TProductInsert = typeof products.$inferInsert;

export const categories = pgTable("categories", {
  id: id(),

  // info
  name: text("name").notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TCategory = typeof categories.$inferSelect;
export type TCategoryInsert = typeof categories.$inferInsert;

export const customers = pgTable("customers", {
  id: id(),

  // info
  name: text("name").notNull(),
  address: text("address"),

  // contact
  email: text("email"),
  phone: text("phone").notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TCustomer = typeof customers.$inferSelect;
export type TCustomerInsert = typeof customers.$inferInsert;

export const suppliers = pgTable("suppliers", {
  id: id(),

  // info
  name: text("name").notNull(),
  address: text("address"),

  // contact
  email: text("email"),
  phone: text("phone").notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TSupplier = typeof suppliers.$inferSelect;
export type TSupplierInsert = typeof suppliers.$inferInsert;

export const orders = pgTable("orders", {
  id: id(),

  // info
  customerId: text("customerId").references(() => customers.id, {
    onDelete: "cascade",
  }),

  totalPrice: real("totalPrice").notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TOrder = typeof orders.$inferSelect;
export type TOrderInsert = typeof orders.$inferInsert;

export const ordersItems = pgTable("ordersItems", {
  id: id(),

  // info
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

export const purchases = pgTable("purchases", {
  id: id(),

  // info
  supplierId: text("supplierId")
    .notNull()
    .references(() => suppliers.id, { onDelete: "cascade" }),
  totalCost: real("totalCost").notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TPurchase = typeof purchases.$inferSelect;
export type TPurchaseInsert = typeof purchases.$inferInsert;

export const purchasesItems = pgTable("purchasesItems", {
  id: id(),

  // info
  purchaseId: text("purchaseId")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  cost: real("cost").notNull(),
});

export const notifications = pgTable("notifications", {
  id: id(),

  // info
  title: text("title").notNull(),
  description: text("description").notNull(),
  read: boolean("read").notNull().default(false),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export const taskTypes = pgTable("taskTypes", {
  id: id(),
  name: text("name").notNull(),
});

export type TTaskType = typeof taskTypes.$inferSelect;

export const taskStatuses = pgTable("taskStatuses", {
  id: id(),
  name: text("name").notNull(),
});

export type TTaskStatus = typeof taskStatuses.$inferSelect;

export const tasks = pgTable("tasks", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),

  typeId: text("typeId")
    .notNull()
    .references(() => taskTypes.id, { onDelete: "cascade" }),

  statusId: text("statusId")
    .notNull()
    .references(() => taskStatuses.id, {
      onDelete: "cascade",
    }),

  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  deletedAt: deletedAt(),
  createdAt: createdAt(),
});

export type TTask = typeof tasks.$inferSelect;
export type TTaskInsert = typeof tasks.$inferInsert;

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
  items: many(purchasesItems),
}));

export const purchasesItemsRelations = relations(purchasesItems, ({ one }) => ({
  product: one(products, {
    fields: [purchasesItems.productId],
    references: [products.id],
  }),
  purchase: one(purchases, {
    fields: [purchasesItems.purchaseId],
    references: [purchases.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchases: many(purchases),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  purchasesItems: many(purchasesItems),
}));

export const userRelations = relations(users, ({ many }) => ({
  user: many(products),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items: many(ordersItems),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const ordersItemsRelations = relations(ordersItems, ({ one }) => ({
  order: one(orders, {
    fields: [ordersItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [ordersItems.productId],
    references: [products.id],
  }),
}));

export const taskTypesRelations = relations(taskTypes, ({ many }) => ({
  tasks: many(tasks),
}));

export const taskStatusesRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  status: one(taskStatuses, {
    fields: [tasks.statusId],
    references: [taskStatuses.id],
  }),
  type: one(taskTypes, {
    fields: [tasks.typeId],
    references: [taskTypes.id],
  }),
}));
