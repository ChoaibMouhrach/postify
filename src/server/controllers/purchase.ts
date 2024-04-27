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
import { redirect } from "next/navigation";
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
            cost: product.cost,
          };
        }),
      );

    const totalCost = ps
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
      ps.map((p) => {
        return {
          purchaseId,
          cost: p.cost,
          productId: p.id,
          quantity: p.quantity,
        };
      }),
    );

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
        cost: product.cost,
      };
    });

    await db.insert(purchasesItems).values(
      ps.map((p) => ({
        cost: p.cost,
        productId: p.id,
        quantity: p.quantity,
        purchaseId: purchase.id,
      })),
    );

    const totalCost = ps
      .map((p) => p.cost * p.quantity)
      .reduce((a, b) => a + b);

    await db
      .update(purchases)
      .set({
        supplierId: input.supplierId,
        totalCost,
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
    } else {
      await purchaseRepository.remove(input.id, user.id);
    }

    revalidatePath(`/purchases`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases/${purchase.id}/edit`);
    redirect("/purchases");
  },
);
