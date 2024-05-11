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

export const businesses = sqliteTable("businesses", {
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

export type TBusiness = typeof businesses.$inferSelect;
export type TBusinessInsert = typeof businesses.$inferInsert;

export const products = sqliteTable("products", {
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
    .references(() => businesses.id, { onDelete: "cascade" }),

  categoryId: text("categoryId").references(() => categories.id, {
    onDelete: "cascade",
  }),

  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TProduct = typeof products.$inferSelect;
export type TProductInsert = typeof products.$inferInsert;

export const categories = sqliteTable("categories", {
  id: id(),

  // info
  name: text("name").notNull(),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TCategory = typeof categories.$inferSelect;
export type TCategoryInsert = typeof categories.$inferInsert;

export const customers = sqliteTable("customers", {
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
    .references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TCustomer = typeof customers.$inferSelect;
export type TCustomerInsert = typeof customers.$inferInsert;

export const suppliers = sqliteTable("suppliers", {
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
    .references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TSupplier = typeof suppliers.$inferSelect;
export type TSupplierInsert = typeof suppliers.$inferInsert;

export const orderTypes = sqliteTable("orderTypes", {
  id: id(),
  name: text("name").notNull(),
});

export type TOrderType = typeof orderTypes.$inferSelect;

export const orders = sqliteTable("orders", {
  id: id(),

  //
  note: text("note"),
  shippingAddress: text("shippingAddress"),
  customerId: text("customerId").references(() => customers.id, {
    onDelete: "cascade",
  }),

  //
  totalPrice: real("totalPrice").notNull(),
  businessId: text("businessId")
    .notNull()
    .references(() => businesses.id, {
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

export type TOrder = typeof orders.$inferSelect;
export type TOrderInsert = typeof orders.$inferInsert;

export const ordersItems = sqliteTable("ordersItems", {
  id: id(),

  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  tax: real("tax").notNull(),
});

export type TOrderItem = typeof ordersItems.$inferSelect;

export const purchases = sqliteTable("purchases", {
  id: id(),

  // info
  supplierId: text("supplierId")
    .notNull()
    .references(() => suppliers.id, { onDelete: "cascade" }),

  totalCost: real("totalCost").notNull(),

  // meta
  businessId: text("businessId")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  deletedAt: deletedAt(),
});

export type TPurchase = typeof purchases.$inferSelect;
export type TPurchaseInsert = typeof purchases.$inferInsert;

export const purchasesItems = sqliteTable("purchasesItems", {
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

export const notifications = sqliteTable("notifications", {
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

export type TNotification = typeof notifications.$inferSelect;
export type TNotificationInsert = typeof notifications.$inferInsert;

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

export const tasks = sqliteTable("tasks", {
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
  business: one(businesses, {
    fields: [purchases.businessId],
    references: [businesses.id],
  }),
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

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  business: one(businesses, {
    fields: [suppliers.businessId],
    references: [businesses.id],
  }),
  purchases: many(purchases),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  purchasesItems: many(purchasesItems),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const userRelations = relations(users, ({ many, one }) => ({
  user: many(products),
  businesses: many(businesses),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const customersRelations = relations(customers, ({ many, one }) => ({
  orders: many(orders),
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
}));

export const orderTypesRelations = relations(orderTypes, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items: many(ordersItems),
  type: one(orderTypes, {
    fields: [orders.orderTypeId],
    references: [orderTypes.id],
  }),
  business: one(businesses, {
    fields: [orders.businessId],
    references: [businesses.id],
  }),
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
