"use server";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "@/common/schemas/purchase";
import { db } from "@/server/db";
import { products, purchases, purchasesItems } from "@/server/db/schema";
import { action, auth } from "@/server/lib/action";
import { purchaseRepository } from "@/server/repositories/purchase";
import { and, eq, inArray } from "drizzle-orm";
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

    let ps = await db.query.products
      .findMany({
        where: and(
          eq(products.userId, user.id),
          inArray(
            products.id,
            input.products.map((product) => product.id),
          ),
        ),
      })
      .then((ps) =>
        ps.map((p) => {
          const product = input.products.find(
            (product) => product.id === p.id,
          )!;

          return {
            ...p,
            quantity: product.quantity,
          };
        }),
      );

    const totalCost = ps
      .map((p) => p.quantity * p.price)
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
      ps.map((p) => {
        return {
          purchaseId,
          cost: p.price,
          productId: p.id,
          quantity: p.quantity,
        };
      }),
    );

    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchaseId}/edit`);
  },
);

export const updatePurchaseAction = action(
  updatePurchaseSchema,
  async (input) => {
    const user = await auth();

    const purchase = await purchaseRepository.findOrThrow(input.id, user.id);

    await db
      .delete(purchasesItems)
      .where(eq(purchasesItems.purchaseId, input.id));

    const items = await db.query.products.findMany({
      where: and(
        eq(products.userId, user.id),
        inArray(
          products.id,
          input.products.map((product) => product.id),
        ),
      ),
    });

    const ps = items.map((item) => {
      const product = input.products.find((p) => p.id === item.id)!;

      return {
        ...item,
        quantity: product.quantity,
      };
    });

    await db.insert(purchasesItems).values(
      ps.map((p) => ({
        cost: p.price,
        productId: p.id,
        quantity: p.quantity,
        purchaseId: purchase.id,
      })),
    );

    await db
      .update(purchases)
      .set({
        supplierId: input.supplierId,
        totalCost: ps.map((p) => p.price * p.quantity).reduce((a, b) => a + b),
      })
      .where(eq(purchases.id, input.id));

    revalidatePath(`/purchases/${purchase.id}/edit`);
    revalidatePath(`/purchases`);
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

    if (purchase.deletedAt) {
      await purchaseRepository.permRemove(input.id, user.id);
      return;
    }

    await purchaseRepository.remove(input.id, user.id);

    revalidatePath(`/purchases`);
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);
