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
import { redirect } from "next/navigation";
import { notificationRepository } from "../repositories/notification";

const indexSchema = z.object({
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
  from: fromSchema,
  to: toSchema,
});

export const getOrdersAction = async (input: unknown) => {
  const user = await rscAuth();

  const { page, trash, query, from, to } = indexSchema.parse(input);

  const customersRequest = db
    .select({
      id: customers.id,
    })
    .from(customers)
    .where(
      and(eq(customers.userId, user.id), ilike(customers.name, `%${query}%`)),
    );

  const where = and(
    eq(orders.userId, user.id),
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
    // meta
    trash,
    query,
    from,
    to,
    // pagination
    page,
    lastPage,
  };
};

export const createOrderAction = action(createOrderSchema, async (input) => {
  const user = await auth();

  const customer = await customerRepository.findOrThrow(
    input.customerId,
    user.id,
  );

  const ps = await db.query.products.findMany({
    where: and(
      eq(products.userId, user.id),
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
    .map((item) => item.price * item.quantity)
    .reduce((a, b) => a + b);

  const order = await orderRepository.create({
    customerId: customer.id,
    userId: user.id,
    totalPrice,
  });

  await db.insert(ordersItems).values(
    items.map((item) => {
      return {
        orderId: order.id,
        price: item.price,
        productId: item.id,
        quantity: item.quantity,
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
          .where(and(eq(products.id, item.id), eq(products.userId, user.id)));

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

  const order = await orderRepository.findOrThrow(input.id, user.id);

  if (order.customerId !== input.customerId) {
    const customer = await customerRepository.findOrThrow(
      input.customerId,
      user.id,
    );

    await orderRepository.update(customer.id, user.id, {
      customerId: input.customerId,
    });
  }

  const oldItems = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.id),
  });

  await db.delete(ordersItems).where(eq(ordersItems.orderId, order.id));

  const newItems = await db.query.products.findMany({
    where: and(
      eq(products.userId, user.id),
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
      return {
        orderId: order.id,
        productId: product.id,
        price: product.price,
        quantity: product.new.quantity,
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
            .where(and(eq(products.id, item.id), eq(products.userId, user.id)));
        }

        return new Promise(async (res) => {
          await db
            .update(products)
            .set({
              stock: sql<string>`${products.stock} - ${q}`,
            })
            .where(and(eq(products.id, item.id), eq(products.userId, user.id)));

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
          .where(and(eq(products.id, item.id), eq(products.userId, user.id)));

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
          and(eq(products.id, item.productId), eq(products.userId, user.id)),
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
  id: z.string().uuid(),
});

export const deleteOrderAction = action(schema, async (input) => {
  const user = await auth();

  const order = await orderRepository.findOrThrow(input.id, user.id);

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
          and(eq(products.id, item.productId), eq(products.userId, user.id)),
        );
    }),
  );

  if (order.deletedAt) {
    await orderRepository.permRemove(input.id, user.id);
  } else {
    await orderRepository.remove(input.id, user.id);
  }

  revalidatePath(`/orders`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/orders/${order.id}/edit`);
  redirect("/orders");
});

export const restoreOrderAction = action(schema, async (input) => {
  const user = await auth();

  const order = await orderRepository.findOrThrow(input.id, user.id);

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
          and(eq(products.id, item.productId), eq(products.userId, user.id)),
        );
    }),
  );

  await orderRepository.restore(input.id, user.id);

  revalidatePath(`/orders`);
  revalidatePath(`/orders/${order.id}/edit`);
});
