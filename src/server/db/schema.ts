import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  primaryKey,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

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

export const roles = sqliteTable("roles", {
  id: id(),
  name: text("name").notNull(),
});

export type TRole = typeof roles.$inferSelect;

export const users = sqliteTable("user", {
  id: id(),
  name: text("name"),
  image: text("image"),
  email: text("email").notNull(),
  emailVerified: text("emailVerified"),

  // roles
  roleId: text("roleId").references(() => roles.id, { onDelete: "cascade" }),
});

export type TUser = typeof users.$inferSelect;

export const accounts = sqliteTable(
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

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: text("expires").notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: text("expires").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const businessesTable = sqliteTable("businesses", {
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
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  // timestamps
  deletedAt: deletedAt(),
  createdAt: createdAt(),
});

export type TBusiness = typeof businessesTable.$inferSelect;
export type TBusinessInsert = typeof businessesTable.$inferInsert;

export const productsTable = sqliteTable("products", {
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

export const categoriesTable = sqliteTable("categories", {
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

export const customersTable = sqliteTable("customers", {
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

export const suppliersTable = sqliteTable("suppliers", {
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

export const orderTypes = sqliteTable("orderTypes", {
  id: id(),
  name: text("name").notNull(),
});

export type TOrderType = typeof orderTypes.$inferSelect;

export const ordersTable = sqliteTable("orders", {
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

export const ordersItems = sqliteTable("ordersItems", {
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

export const purchasesTable = sqliteTable("purchases", {
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

export const purchasesItems = sqliteTable("purchasesItems", {
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

export const notificationsTable = sqliteTable("notifications", {
  id: id(),

  // info
  title: text("title").notNull(),
  description: text("description"),
  read: integer("read", {
    mode: "boolean",
  })
    .default(false)
    .notNull(),

  // meta
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TNotification = typeof notificationsTable.$inferSelect;
export type TNotificationInsert = typeof notificationsTable.$inferInsert;

export const taskTypes = sqliteTable("taskTypes", {
  id: id(),
  name: text("name").notNull(),
});

export type TTaskType = typeof taskTypes.$inferSelect;

export const taskStatuses = sqliteTable("taskStatuses", {
  id: id(),
  name: text("name").notNull(),
});

export type TTaskStatus = typeof taskStatuses.$inferSelect;

export const tasksTable = sqliteTable("tasks", {
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

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const userRelations = relations(users, ({ many, one }) => ({
  user: many(productsTable),
  businesses: many(businessesTable),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
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
