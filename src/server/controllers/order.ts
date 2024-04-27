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
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { customers, orders, ordersItems, products } from "../db/schema";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const indexSchema = z.object({
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
});

export const getOrdersAction = async (input: unknown) => {
  const user = await rscAuth();

  const { page, trash, query } = indexSchema.parse(input);

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
    data,
    lastPage,
    page,
    trash,
    query,
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

  revalidatePath(`/orders`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/orders/${order.id}/edit`);
});

export const updateOrderAction = action(updateOrderSchema, async (input) => {
  const user = await auth();

  const order = await orderRepository.findOrThrow(input.id, user.id);

  if (order.customerId !== input.customerId) {
    await customerRepository.findOrThrow(input.customerId, user.id);
  }

  await db.delete(ordersItems).where(eq(ordersItems.orderId, order.id));

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

  const totalPrice = items
    .map((item) => item.price * item.quantity)
    .reduce((a, b) => a + b);

  await orderRepository.update(input.id, user.id, {
    customerId: input.customerId,
    totalPrice,
  });

  revalidatePath(`/orders`);
  revalidatePath(`/orders/${order.id}/edit`);
});

const schema = z.object({
  id: z.string().uuid(),
});

export const deleteOrderAction = action(schema, async (input) => {
  const user = await auth();

  const order = await orderRepository.findOrThrow(input.id, user.id);

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

  await orderRepository.restore(input.id, user.id);

  revalidatePath(`/orders`);
  revalidatePath(`/orders/${order.id}/edit`);
});
