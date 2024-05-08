"use server";

import { z } from "zod";
import { action, auth, rscAuth } from "../lib/action";
import { createOrderSchema, updateOrderSchema } from "@/common/schemas/order";
import { customerRepository } from "../repositories/customer";
import { orderRepository } from "../repositories/order";
import { db } from "../db";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { customers, orders, ordersItems, products } from "../db/schema";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
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
      id: customers.id,
    })
    .from(customers)
    .where(
      and(
        eq(customers.businessId, business.id),
        ilike(customers.name, `%${query}%`),
      ),
    );

  const where = and(
    eq(orders.businessId, businessId),
    trash ? isNotNull(orders.deletedAt) : isNull(orders.deletedAt),
    from || to
      ? and(
          from
            ? gte(orders.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            orders.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,

    query
      ? or(
          ilike(orders.id, query),
          inArray(orders.customerId, customersRequest),
        )
      : undefined,
  );

  const dataPromise = db.query.orders.findMany({
    where,
    with: {
      customer: true,
    },
    orderBy: desc(orders.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(orders)
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

  const customer = await customerRepository.findOrThrow(
    input.customerId,
    business.id,
  );

  const ps = await db.query.products.findMany({
    where: and(
      eq(products.businessId, business.id),
      inArray(
        products.id,
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
    .reduce((a, b) => a + b);

  const order = await orderRepository.create({
    note: input.note || null,
    shippingAddress: input.shippingAddress,
    customerId: customer.id,
    businessId: business.id,
    totalPrice,
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
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(
            and(eq(products.id, item.id), eq(products.businessId, business.id)),
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
  revalidatePath(`/orders/${order.id}/edit`);
});

export const updateOrderAction = action(updateOrderSchema, async (input) => {
  const user = await auth();

  const business = await businessRepository.findOrThrow(
    input.businessId,
    user.id,
  );

  const order = await orderRepository.findOrThrow(input.id, business.id);

  if (order.customerId && order.customerId !== input.customerId) {
    await customerRepository.findOrThrow(input.customerId, business.id);
  }

  await orderRepository.update(order.id, business.id, {
    note: input.note,
    customerId: input.customerId,
    shippingAddress: input.shippingAddress,
  });

  const oldItems = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.id),
    with: {
      product: true,
    },
  });

  await db.delete(ordersItems).where(eq(ordersItems.orderId, order.id));

  const newItems = await db.query.products.findMany({
    where: and(
      eq(products.businessId, business.id),
      inArray(
        products.id,
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

  await db.insert(ordersItems).values(
    items.map((product) => {
      if ("old" in product) {
        return {
          orderId: order.id,
          productId: product.id,
          price: product.price,
          quantity: product.new.quantity,
          tax: product.old.tax,
        };
      }

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
            .update(products)
            .set({
              stock: sql<string>`${products.stock} + ${q}`,
            })
            .where(
              and(
                eq(products.id, item.id),
                eq(products.businessId, business.id),
              ),
            );
        }

        return new Promise(async (res) => {
          await db
            .update(products)
            .set({
              stock: sql<string>`${products.stock} - ${q}`,
            })
            .where(
              and(
                eq(products.id, item.id),
                eq(products.businessId, business.id),
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
          .update(products)
          .set({
            stock: sql<string>`${products.stock} - ${item.new.quantity}`,
          })
          .where(
            and(eq(products.id, item.id), eq(products.businessId, business.id)),
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
        .update(products)
        .set({
          stock: sql<string>`${products.stock} + ${item.quantity}`,
        })
        .where(
          and(
            eq(products.id, item.productId),
            eq(products.businessId, business.id),
          ),
        );
    }),
  ]);

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath(`/orders?${order.id}/edit`);
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

  const items = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.id),
  });

  await Promise.all(
    items.map((item) => {
      return db
        .update(products)
        .set({
          stock: sql`${products.stock} + ${item.quantity}`,
        })
        .where(
          and(
            eq(products.id, item.productId),
            eq(products.businessId, business.id),
          ),
        );
    }),
  );

  if (order.deletedAt) {
    await orderRepository.permRemove(input.id, business.id);
  } else {
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
        .update(products)
        .set({
          stock: sql`${products.stock} + ${item.quantity}`,
        })
        .where(
          and(
            eq(products.id, item.productId),
            eq(products.businessId, business.id),
          ),
        );
    }),
  );

  await orderRepository.restore(input.id, business.id);

  revalidatePath(`/orders`);
  revalidatePath(`/orders/${order.id}/edit`);
});
