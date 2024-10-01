"use server";

import { z } from "zod";
import {
  NotfoundError,
  RequiredError,
  action,
  auth,
  rscAuth,
} from "../lib/action";
import { createOrderSchema, updateOrderSchema } from "@/common/schemas/order";
import { customerRepository } from "../repositories/customer";
import { orderRepository } from "../repositories/order";
import { db } from "../db";
import {
  and,
  between,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import {
  customersTable,
  orderTypes,
  ordersTable,
  ordersItems,
  productsTable,
} from "../db/schema";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { ORDER_TYPES, RECORDS_LIMIT } from "@/common/constants";
import { revalidatePath } from "next/cache";
import { notificationRepository } from "../repositories/notification";
import { businessRepository } from "../repositories/business";

const indexSchema = z.object({
  businessId: z.string().uuid(),
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
  from: fromSchema,
  to: toSchema,
});

export const getOrdersAction = async (input: unknown) => {
  const { page, trash, query, from, to, businessId } = indexSchema.parse(input);

  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(businessId, user.id);

  const customersRequest = db
    .select({
      id: customersTable.id,
    })
    .from(customersTable)
    .where(
      and(
        eq(customersTable.businessId, business.id),
        ilike(customersTable.name, `%${query}%`),
      ),
    );

  const where = and(
    eq(ordersTable.businessId, businessId),
    trash ? isNotNull(ordersTable.deletedAt) : isNull(ordersTable.deletedAt),
    from && to
      ? between(
          ordersTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query
      ? or(
          ilike(ordersTable.id, query),
          inArray(ordersTable.customerId, customersRequest),
        )
      : undefined,
  );

  const dataPromise = db.query.orders.findMany({
    where,
    with: {
      customer: true,
      type: true,
    },
    orderBy: desc(ordersTable.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(ordersTable)
    .where(where)
    .then((orders) => parseInt(orders[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return {
    // data
    data,
    business,

    // meta
    query,
    trash,
    from,
    to,

    // pagination
    page,
    lastPage,
  };
};

export const createOrderAction = action(createOrderSchema, async (input) => {
  const user = await auth();

  const business = await businessRepository.findOrThrow(
    input.businessId,
    user.id,
  );

  if (input.customerId) {
    await customerRepository.findOrThrow(input.customerId, business.id);

    if (!input.shippingAddress) {
      throw new RequiredError("Shipping address");
    }
  }

  const ps = await db.query.products.findMany({
    where: and(
      eq(productsTable.businessId, business.id),
      inArray(
        productsTable.id,
        input.products.map((product) => product.id),
      ),
    ),
  });

  const items = ps.map((product) => {
    const p = input.products.find((p) => p.id === product.id)!;

    return {
      ...product,
      quantity: p.quantity,
    };
  });

  const totalPrice = items
    .map((item) => {
      const tbt = item.price * item.quantity;
      return tbt + (tbt * item.tax) / 100;
    })
    .reduce((a, b) => a + b)
    .toFixed(2);

  const orderType = await db.query.orderTypes.findFirst({
    where: input.customerId
      ? eq(orderTypes.name, ORDER_TYPES.CUSTOMER)
      : eq(orderTypes.name, ORDER_TYPES.WALKING_CUSTOMER),
  });

  if (!orderType) {
    throw new NotfoundError("Order type");
  }

  const order = await orderRepository.create({
    shippingAddress: input.shippingAddress || null,
    customerId: input.customerId || null,
    orderTypeId: orderType.id,
    note: input.note || null,
    businessId: business.id,
    totalPrice: parseFloat(totalPrice),
  });

  await db.insert(ordersItems).values(
    items.map((item) => {
      return {
        orderId: order.id,
        productId: item.id,
        price: item.price,
        quantity: item.quantity,
        tax: item.tax,
      };
    }),
  );

  await Promise.all(
    items.map((item) => {
      return new Promise(async (res) => {
        await db
          .update(productsTable)
          .set({
            stock: sql`${productsTable.stock} - ${item.quantity}`,
          })
          .where(
            and(
              eq(productsTable.id, item.id),
              eq(productsTable.businessId, business.id),
            ),
          );

        if (item.stock - item.quantity <= 5) {
          await notificationRepository.create({
            title: `${item.name} is about to go out of stock`,
            userId: user.id,
          });
        }

        res("");
      });
    }),
  );

  revalidatePath(`/orders`);
  revalidatePath("/notifications");
  revalidatePath(`/dashboard`);
});

export const updateOrderAction = action(updateOrderSchema, async (input) => {
  const user = await auth();

  const business = await businessRepository.findOrThrow(
    input.businessId,
    user.id,
  );

  const order = await orderRepository.findOrThrow(input.id, business.id);

  if (input.customerId) {
    if (input.customerId !== order.customerId) {
      await customerRepository.findOrThrow(input.customerId, business.id);
    }

    if (!input.shippingAddress) {
      throw new RequiredError("Shipping address");
    }
  }

  const orderType = await db.query.orderTypes.findFirst({
    where: input.customerId
      ? eq(orderTypes.name, ORDER_TYPES.CUSTOMER)
      : eq(orderTypes.name, ORDER_TYPES.WALKING_CUSTOMER),
  });

  if (!orderType) {
    throw new NotfoundError("Order type");
  }

  const oldItems = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.id),
    with: {
      product: true,
    },
  });

  await db.delete(ordersItems).where(eq(ordersItems.orderId, order.id));

  const newItems = await db.query.products.findMany({
    where: and(
      eq(productsTable.businessId, business.id),
      inArray(
        productsTable.id,
        input.products.map((product) => product.id),
      ),
    ),
  });

  const items = newItems.map((item) => {
    const product = input.products.find((product) => product.id === item.id)!;
    const old = oldItems.find((old) => old.productId === item.id);

    if (old) {
      return {
        ...item,
        new: product,
        old,
      };
    }

    return {
      ...item,
      new: product,
    };
  });

  const totalPrice = items
    .map((item) => {
      const tbt = item.new.quantity * item.price;
      return tbt + (tbt * item.tax) / 100;
    })
    .reduce((a, b) => a + b)
    .toFixed(2);

  await orderRepository.update(order.id, business.id, {
    note: input.note,
    customerId: input.customerId || null,
    shippingAddress: input.shippingAddress || null,
    orderTypeId: orderType.id,
    totalPrice: parseFloat(totalPrice),
  });

  await db.insert(ordersItems).values(
    items.map((product) => {
      return {
        orderId: order.id,
        productId: product.id,
        price: product.price,
        quantity: product.new.quantity,
        tax: product.tax,
      };
    }),
  );

  await Promise.all([
    ...items.map((item) => {
      if ("old" in item) {
        if (item.old.quantity === item.new.quantity) {
          return;
        }

        const q = Math.abs(item.old.quantity - item.new.quantity);

        if (item.old.quantity > item.new.quantity) {
          return db
            .update(productsTable)
            .set({
              stock: sql<string>`${productsTable.stock} + ${q}`,
            })
            .where(
              and(
                eq(productsTable.id, item.id),
                eq(productsTable.businessId, business.id),
              ),
            );
        }

        return new Promise(async (res) => {
          await db
            .update(productsTable)
            .set({
              stock: sql<string>`${productsTable.stock} - ${q}`,
            })
            .where(
              and(
                eq(productsTable.id, item.id),
                eq(productsTable.businessId, business.id),
              ),
            );

          if (item.stock - q <= 5) {
            await notificationRepository.create({
              title: `${item.name} is about to go out of stock`,
              userId: user.id,
            });
          }

          res(true);
        });
      }

      return new Promise(async (res) => {
        await db
          .update(productsTable)
          .set({
            stock: sql<string>`${productsTable.stock} - ${item.new.quantity}`,
          })
          .where(
            and(
              eq(productsTable.id, item.id),
              eq(productsTable.businessId, business.id),
            ),
          );

        if (item.stock - item.new.quantity <= 5) {
          await notificationRepository.create({
            title: `${item.name} is about to go out of stock`,
            userId: user.id,
          });
        }

        res(true);
      });
    }),
    ...oldItems.map((item) => {
      const product = input.products.find(
        (product) => product.id === item.productId,
      );

      if (product) {
        return;
      }

      return db
        .update(productsTable)
        .set({
          stock: sql<string>`${productsTable.stock} + ${item.quantity}`,
        })
        .where(
          and(
            eq(productsTable.id, item.productId),
            eq(productsTable.businessId, business.id),
          ),
        );
    }),
  ]);

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
});

const schema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteOrderAction = action(schema, async (input) => {
  const user = await auth();

  const business = await businessRepository.findOrThrow(
    input.businessId,
    user.id,
  );

  const order = await orderRepository.findOrThrow(input.id, business.id);

  if (order.deletedAt) {
    await orderRepository.permRemove(input.id, business.id);
  } else {
    const items = await db.query.ordersItems.findMany({
      where: eq(ordersItems.orderId, order.id),
    });

    await Promise.all(
      items.map((item) => {
        return db
          .update(productsTable)
          .set({
            stock: sql`${productsTable.stock} + ${item.quantity}`,
          })
          .where(
            and(
              eq(productsTable.id, item.productId),
              eq(productsTable.businessId, business.id),
            ),
          );
      }),
    );

    await orderRepository.remove(input.id, business.id);
  }

  revalidatePath(`/orders`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/orders/${order.id}/edit`);
});

export const restoreOrderAction = action(schema, async (input) => {
  const user = await auth();

  const business = await businessRepository.findOrThrow(
    input.businessId,
    user.id,
  );

  const order = await orderRepository.findOrThrow(input.id, business.id);

  if (!order.deletedAt) {
    return;
  }

  const items = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.id),
  });

  await Promise.all(
    items.map((item) => {
      return db
        .update(productsTable)
        .set({
          stock: sql`${productsTable.stock} + ${item.quantity}`,
        })
        .where(
          and(
            eq(productsTable.id, item.productId),
            eq(productsTable.businessId, business.id),
          ),
        );
    }),
  );

  await orderRepository.restore(input.id, business.id);

  revalidatePath(`/orders`);
  revalidatePath(`/orders/${order.id}/edit`);
});
