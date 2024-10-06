"use server";

import { z } from "zod";
import { NotfoundError, RequiredError, protectedAction } from "../lib/action";
import { createOrderSchema, updateOrderSchema } from "@/common/schemas/order";
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
import { ORDER_TYPES, RECORDS_LIMIT } from "@/common/constants";
import { businessIndexBaseSchema } from "@/common/schemas";
import { BusinessesRepo } from "../repositories/business";
import {
  customersTable,
  ordersItems,
  ordersTable,
  orderTypes,
  productsTable,
} from "../db/schema";
import { CustomerRepo } from "../repositories/customer";
import { OrderRepo } from "../repositories/order";
import { NotificationRepo } from "../repositories/notification";

export const getOrdersAction = protectedAction
  .schema(businessIndexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const customersRequest = db
      .select({
        id: customersTable.id,
      })
      .from(customersTable)
      .where(
        and(
          eq(customersTable.businessId, business.data.id),
          ilike(customersTable.name, `%${parsedInput.query}%`),
        ),
      );

    const where = and(
      eq(ordersTable.businessId, parsedInput.businessId),
      parsedInput.trash
        ? isNotNull(ordersTable.deletedAt)
        : isNull(ordersTable.deletedAt),
      parsedInput.from && parsedInput.to
        ? between(
            ordersTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,
      parsedInput.query
        ? or(
            ilike(ordersTable.id, parsedInput.query),
            inArray(ordersTable.customerId, customersRequest),
          )
        : undefined,
    );

    const dataPromise = db.query.ordersTable.findMany({
      where,
      with: {
        customer: true,
        type: true,
      },
      orderBy: desc(ordersTable.createdAt),
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
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
      query: parsedInput.query,
      trash: parsedInput.trash,
      from: parsedInput.from,
      to: parsedInput.to,

      // pagination
      page: parsedInput.page,
      lastPage,
    };
  });

export const createOrderAction = protectedAction
  .schema(createOrderSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    if (parsedInput.customerId) {
      await CustomerRepo.findOrThrow({
        id: parsedInput.customerId,
        businessId: business.data.id,
      });

      if (!parsedInput.shippingAddress) {
        throw new RequiredError("Shipping address");
      }
    }

    const ps = await db.query.productsTable.findMany({
      where: and(
        eq(productsTable.businessId, business.data.id),
        inArray(
          productsTable.id,
          parsedInput.products.map((product) => product.id),
        ),
      ),
    });

    const items = ps.map((product) => {
      const p = parsedInput.products.find((p) => p.id === product.id)!;

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
      where: parsedInput.customerId
        ? eq(orderTypes.name, ORDER_TYPES.CUSTOMER)
        : eq(orderTypes.name, ORDER_TYPES.WALKING_CUSTOMER),
    });

    if (!orderType) {
      throw new NotfoundError("Order type");
    }

    const [order] = await OrderRepo.create([
      {
        shippingAddress: parsedInput.shippingAddress || null,
        customerId: parsedInput.customerId || null,
        orderTypeId: orderType.id,
        note: parsedInput.note || null,
        businessId: business.data.id,
        totalPrice: parseFloat(totalPrice),
      },
    ]);

    await db.insert(ordersItems).values(
      items.map((item) => {
        return {
          orderId: order.data.id,
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
                eq(productsTable.businessId, business.data.id),
              ),
            );

          if (item.stock - item.quantity <= 5) {
            await NotificationRepo.create([
              {
                title: `${item.name} is about to go out of stock`,
                userId: authUser.id,
              },
            ]);
          }

          res("");
        });
      }),
    );
  });

export const updateOrderAction = protectedAction
  .schema(updateOrderSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const order = await OrderRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (parsedInput.customerId) {
      if (parsedInput.customerId !== order.data.customerId) {
        await CustomerRepo.findOrThrow({
          id: parsedInput.customerId,
          businessId: business.data.id,
        });
      }

      if (!parsedInput.shippingAddress) {
        throw new RequiredError("Shipping address");
      }
    }

    const orderType = await db.query.orderTypes.findFirst({
      where: parsedInput.customerId
        ? eq(orderTypes.name, ORDER_TYPES.CUSTOMER)
        : eq(orderTypes.name, ORDER_TYPES.WALKING_CUSTOMER),
    });

    if (!orderType) {
      throw new NotfoundError("Order type");
    }

    const oldItems = await db.query.ordersItems.findMany({
      where: eq(ordersItems.orderId, order.data.id),
      with: {
        product: true,
      },
    });

    await db.delete(ordersItems).where(eq(ordersItems.orderId, order.data.id));

    const newItems = await db.query.productsTable.findMany({
      where: and(
        eq(productsTable.businessId, business.data.id),
        inArray(
          productsTable.id,
          parsedInput.products.map((product) => product.id),
        ),
      ),
    });

    const items = newItems.map((item) => {
      const product = parsedInput.products.find(
        (product) => product.id === item.id,
      )!;
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

    await OrderRepo.update(
      {
        id: order.data.id,
        businessId: business.data.id,
      },
      {
        note: parsedInput.note,
        customerId: parsedInput.customerId || null,
        shippingAddress: parsedInput.shippingAddress || null,
        orderTypeId: orderType.id,
        totalPrice: parseFloat(totalPrice),
      },
    );

    await db.insert(ordersItems).values(
      items.map((product) => {
        return {
          orderId: order.data.id,
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
                  eq(productsTable.businessId, business.data.id),
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
                  eq(productsTable.businessId, business.data.id),
                ),
              );

            if (item.stock - q <= 5) {
              await NotificationRepo.create([
                {
                  title: `${item.name} is about to go out of stock`,
                  userId: authUser.id,
                },
              ]);
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
                eq(productsTable.businessId, business.data.id),
              ),
            );

          if (item.stock - item.new.quantity <= 5) {
            await NotificationRepo.create([
              {
                title: `${item.name} is about to go out of stock`,
                userId: authUser.id,
              },
            ]);
          }

          res(true);
        });
      }),
      ...oldItems.map((item) => {
        const product = parsedInput.products.find(
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
              eq(productsTable.businessId, business.data.id),
            ),
          );
      }),
    ]);
  });

const schema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteOrderAction = protectedAction
  .schema(schema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const order = await OrderRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (order.data.deletedAt) {
      await OrderRepo.permRemove({
        id: parsedInput.id,
        businessId: business.data.id,
      });
    } else {
      const items = await db.query.ordersItems.findMany({
        where: eq(ordersItems.orderId, order.data.id),
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
                eq(productsTable.businessId, business.data.id),
              ),
            );
        }),
      );

      await OrderRepo.remove({
        id: parsedInput.id,
        businessId: business.data.id,
      });
    }
  });

export const restoreOrderAction = protectedAction
  .schema(schema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const order = await OrderRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!order.data.deletedAt) {
      return;
    }

    const items = await db.query.ordersItems.findMany({
      where: eq(ordersItems.orderId, order.data.id),
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
              eq(productsTable.businessId, business.data.id),
            ),
          );
      }),
    );

    await OrderRepo.restore({
      id: parsedInput.id,
      businessId: business.data.id,
    });
  });
