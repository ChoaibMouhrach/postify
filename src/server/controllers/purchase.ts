"use server";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "@/common/schemas/purchase";
import { db } from "@/server/db";
import { products, purchases, purchasesItems } from "@/server/db/schema";
import { action, auth } from "@/server/lib/action";
import { purchaseRepository } from "@/server/repositories/purchase";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const restorePurchaseSchema = z.object({
  id: z.string().uuid(),
});

export const restorePurchaseAction = action(
  restorePurchaseSchema,
  async (input) => {
    const user = await auth();

    const purchase = await purchaseRepository.findOrThrow(input.id, user.id);

    if (!purchase.deletedAt) {
      return;
    }

    const items = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.id),
    });

    await Promise.all(
      items.map((item) => {
        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }),
    );

    await db
      .update(purchases)
      .set({
        deletedAt: null,
      })
      .where(eq(purchases.id, input.id));

    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);

export const createPurchaseAction = action(
  createPurchaseSchema,
  async (input) => {
    const user = await auth();

    let ps = await db.query.products.findMany({
      where: and(
        eq(products.userId, user.id),
        inArray(
          products.id,
          input.products.map((product) => product.id),
        ),
      ),
    });

    const items = ps.map((p) => {
      const product = input.products.find((product) => product.id === p.id)!;

      return {
        ...p,
        quantity: product.quantity,
        cost: product.cost,
      };
    });

    const totalCost = items
      .map((p) => p.quantity * p.cost)
      .reduce((a, b) => a + b);

    const purchaseId = await purchaseRepository
      .create({
        supplierId: input.supplierId,
        userId: user.id,
        totalCost,
      })
      .returning({ id: purchases.id })
      .then((ps) => ps[0].id);

    await db.insert(purchasesItems).values(
      items.map((p) => {
        return {
          purchaseId,
          cost: p.cost,
          productId: p.id,
          quantity: p.quantity,
        };
      }),
    );

    await Promise.all(
      items.map((item) => {
        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.id));
      }),
    );

    // revalidate products
    revalidatePath("/products");

    // revalidate purchases
    revalidatePath("/purchases");
    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases/${purchaseId}/edit`);
  },
);

export const updatePurchaseAction = action(
  updatePurchaseSchema,
  async (input) => {
    const user = await auth();

    const purchase = await purchaseRepository.findOrThrow(input.id, user.id);

    if (purchase.supplierId !== input.supplierId) {
      await purchaseRepository.update(input.id, user.id, {
        supplierId: input.supplierId,
      });
    }

    const oldItems = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.id),
    });

    await db
      .delete(purchasesItems)
      .where(eq(purchasesItems.purchaseId, purchase.id));

    await db.insert(purchasesItems).values(
      input.products.map((product) => ({
        productId: product.id,
        purchaseId: purchase.id,
        cost: product.cost,
        quantity: product.quantity,
      })),
    );

    const newItems = await db.query.products.findMany({
      where: and(
        eq(products.userId, user.id),
        inArray(
          products.id,
          input.products.map((product) => product.id),
        ),
      ),
    });

    await Promise.all([
      ...newItems.map((item) => {
        const product = input.products.find(
          (product) => product.id === item.id,
        )!;

        const oldItem = oldItems.find(
          (oldItem) => oldItem.productId === item.id,
        );

        if (oldItem) {
          const q = Math.abs(product.quantity - oldItem.quantity);

          if (oldItem.quantity === product.quantity) {
            return;
          }

          if (oldItem.quantity > product.quantity) {
            return db
              .update(products)
              .set({
                stock: sql<string>`${products.stock} - ${q}`,
              })
              .where(
                and(eq(products.id, product.id), eq(products.userId, user.id)),
              );
          }

          return db
            .update(products)
            .set({
              stock: sql<string>`${products.stock} + ${q}`,
            })
            .where(
              and(eq(products.id, product.id), eq(products.userId, user.id)),
            );
        }

        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} + ${product.quantity}`,
          })
          .where(
            and(eq(products.id, product.id), eq(products.userId, user.id)),
          );
      }),
      ...oldItems.map((oldItem) => {
        const product = input.products.find(
          (product) => product.id === oldItem.productId,
        );

        if (product) {
          return;
        }

        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} - ${oldItem.quantity}`,
          })
          .where(
            and(
              eq(products.userId, user.id),
              eq(products.id, oldItem.productId),
            ),
          );
      }),
    ]);

    revalidatePath("/products");
    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);

const deletePurchaseSchema = z.object({
  id: z.string().uuid(),
});

export const deletePurchaseAction = action(
  deletePurchaseSchema,
  async (input) => {
    const user = await auth();

    const purchase = await purchaseRepository.findOrThrow(input.id, user.id);

    const items = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.id),
    });

    await Promise.all(
      items.map((item) => {
        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }),
    );

    if (purchase.deletedAt) {
      await purchaseRepository.permRemove(input.id, user.id);
    } else {
      await purchaseRepository.remove(input.id, user.id);
    }

    revalidatePath("/products");

    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases`);
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);
