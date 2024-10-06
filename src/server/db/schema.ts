import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// utils
const id = () => {
  return text("id").notNull().primaryKey().$defaultFn(randomUUID);
};

const createdAt = () => {
  return text("createdAT")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull();
};

const deletedAt = () => {
  return text("deletedAt");
};

// tables
export const rolesTable = pgTable("roles", {
  id: id(),
  name: text("name").notNull(),
});

export type TRole = typeof rolesTable.$inferSelect;

export const usersTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: text("emailVerified"),

  // roles
  roleId: text("roleId")
    .notNull()
    .references(() => rolesTable.id, {
      onDelete: "cascade",
    }),
});

export type TUser = typeof usersTable.$inferSelect;
export type TUserInsert = typeof usersTable.$inferInsert;

export const sessionsTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type TSession = typeof sessionsTable.$inferSelect;
export type TSessionInsert = typeof sessionsTable.$inferInsert;

//
export const variablesTable = pgTable("variables", {
  id: id(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export type TVariable = typeof variablesTable.$inferSelect;
export type TVariableInsert = typeof variablesTable.$inferInsert;

//
export const magicTokensTable = pgTable("magicTokens", {
  id: id(),
  token: text("token").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type TMagicToken = typeof magicTokensTable.$inferSelect;
export type TMagicTokenInsert = typeof magicTokensTable.$inferInsert;

export const businessesTable = pgTable("businesses", {
  id: id(),

  // meta
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  currency: text("currency").notNull(),
  code: text("code"),

  // optional
  address: text("description"),
  email: text("email"),

  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),

  // timestamps
  deletedAt: deletedAt(),
  createdAt: createdAt(),
});

export type TBusiness = typeof businessesTable.$inferSelect;
export type TBusinessInsert = typeof businessesTable.$inferInsert;

export const productsTable = pgTable("products", {
  id: id(),

  // info
  name: text("name").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  unit: text("unit").notNull(),
  tax: real("tax").notNull(),

  // optional
  description: text("description"),
  code: text("code"),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),

  categoryId: text("categoryId").references(() => categoriesTable.id, {
    onDelete: "cascade",
  }),

  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TProduct = typeof productsTable.$inferSelect;
export type TProductInsert = typeof productsTable.$inferInsert;

export const categoriesTable = pgTable("categories", {
  id: id(),

  // info
  name: text("name").notNull(),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TCategory = typeof categoriesTable.$inferSelect;
export type TCategoryInsert = typeof categoriesTable.$inferInsert;

export const customersTable = pgTable("customers", {
  id: id(),

  // info
  name: text("name").notNull(),
  phone: text("phone").notNull(),

  code: text("code"),
  email: text("email"),
  address: text("address"),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TCustomer = typeof customersTable.$inferSelect;
export type TCustomerInsert = typeof customersTable.$inferInsert;

export const suppliersTable = pgTable("suppliers", {
  id: id(),

  // info
  name: text("name").notNull(),
  address: text("address"),

  // contact
  email: text("email"),
  phone: text("phone").notNull(),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TSupplier = typeof suppliersTable.$inferSelect;
export type TSupplierInsert = typeof suppliersTable.$inferInsert;

export const orderTypes = pgTable("orderTypes", {
  id: id(),
  name: text("name").notNull(),
});

export type TOrderType = typeof orderTypes.$inferSelect;

export const ordersTable = pgTable("orders", {
  id: id(),

  //
  note: text("note"),
  shippingAddress: text("shippingAddress"),
  customerId: text("customerId").references(() => customersTable.id, {
    onDelete: "cascade",
  }),

  //
  totalPrice: real("totalPrice").notNull(),
  businessId: text("businessId")
    .notNull()
    .references(() => businessesTable.id, {
      onDelete: "cascade",
    }),
  orderTypeId: text("orderTypeId")
    .notNull()
    .references(() => orderTypes.id, {
      onDelete: "cascade",
    }),

  //
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TOrder = typeof ordersTable.$inferSelect;
export type TOrderInsert = typeof ordersTable.$inferInsert;

export const ordersItems = pgTable("ordersItems", {
  id: id(),

  orderId: text("orderId")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),

  productId: text("productId")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),

  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  tax: real("tax").notNull(),
});

export type TOrderItem = typeof ordersItems.$inferSelect;

export const purchasesTable = pgTable("purchases", {
  id: id(),

  // info
  supplierId: text("supplierId")
    .notNull()
    .references(() => suppliersTable.id, { onDelete: "cascade" }),

  totalCost: real("totalCost").notNull(),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TPurchase = typeof purchasesTable.$inferSelect;
export type TPurchaseInsert = typeof purchasesTable.$inferInsert;

export const purchasesItems = pgTable("purchasesItems", {
  id: id(),

  // info
  purchaseId: text("purchaseId")
    .notNull()
    .references(() => purchasesTable.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  cost: real("cost").notNull(),
});

export const notificationsTable = pgTable("notifications", {
  id: id(),

  // info
  title: text("title").notNull(),
  description: text("description"),
  read: boolean("read").default(false).notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TNotification = typeof notificationsTable.$inferSelect;
export type TNotificationInsert = typeof notificationsTable.$inferInsert;

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

export const tasksTable = pgTable("tasks", {
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
    .references(() => usersTable.id, { onDelete: "cascade" }),

  deletedAt: deletedAt(),
  createdAt: createdAt(),
});

export type TTask = typeof tasksTable.$inferSelect;
export type TTaskInsert = typeof tasksTable.$inferInsert;

export const purchasesRelations = relations(
  purchasesTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [purchasesTable.businessId],
      references: [businessesTable.id],
    }),
    supplier: one(suppliersTable, {
      fields: [purchasesTable.supplierId],
      references: [suppliersTable.id],
    }),
    items: many(purchasesItems),
  }),
);

export const purchasesItemsRelations = relations(purchasesItems, ({ one }) => ({
  product: one(productsTable, {
    fields: [purchasesItems.productId],
    references: [productsTable.id],
  }),
  purchase: one(purchasesTable, {
    fields: [purchasesItems.purchaseId],
    references: [purchasesTable.id],
  }),
}));

export const suppliersRelations = relations(
  suppliersTable,
  ({ many, one }) => ({
    business: one(businessesTable, {
      fields: [suppliersTable.businessId],
      references: [businessesTable.id],
    }),
    purchases: many(purchasesTable),
  }),
);

export const productRelations = relations(productsTable, ({ one, many }) => ({
  purchasesItems: many(purchasesItems),
  category: one(categoriesTable, {
    fields: [productsTable.categoryId],
    references: [categoriesTable.id],
  }),
  business: one(businessesTable, {
    fields: [productsTable.businessId],
    references: [businessesTable.id],
  }),
}));

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}));

export const userRelations = relations(usersTable, ({ many, one }) => ({
  user: many(productsTable),
  businesses: many(businessesTable),
  magicTokens: many(magicTokensTable),
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
}));

export const magicTokenRelations = relations(magicTokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [magicTokensTable.userId],
    references: [usersTable.id],
  }),
}));

export const customersRelations = relations(
  customersTable,
  ({ many, one }) => ({
    orders: many(ordersTable),
    business: one(businessesTable, {
      fields: [customersTable.businessId],
      references: [businessesTable.id],
    }),
  }),
);

export const orderTypesRelations = relations(orderTypes, ({ many }) => ({
  orders: many(ordersTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  items: many(ordersItems),
  type: one(orderTypes, {
    fields: [ordersTable.orderTypeId],
    references: [orderTypes.id],
  }),
  business: one(businessesTable, {
    fields: [ordersTable.businessId],
    references: [businessesTable.id],
  }),
  customer: one(customersTable, {
    fields: [ordersTable.customerId],
    references: [customersTable.id],
  }),
}));

export const ordersItemsRelations = relations(ordersItems, ({ one }) => ({
  order: one(ordersTable, {
    fields: [ordersItems.orderId],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [ordersItems.productId],
    references: [productsTable.id],
  }),
}));

export const taskTypesRelations = relations(taskTypes, ({ many }) => ({
  tasks: many(tasksTable),
}));

export const taskStatusesRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(tasksTable),
}));

export const tasksRelations = relations(tasksTable, ({ one }) => ({
  status: one(taskStatuses, {
    fields: [tasksTable.statusId],
    references: [taskStatuses.id],
  }),
  type: one(taskTypes, {
    fields: [tasksTable.typeId],
    references: [taskTypes.id],
  }),
}));
