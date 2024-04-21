"use server";

import { action, auth } from "@/server/lib/action";
import { createPurchaseSchema } from "./schema";
import { purchaseRepository } from "@/server/repositories/purchase";
import { db } from "@/server/db";
import { and, eq, inArray } from "drizzle-orm";
import { products, purchases, purchasesItems } from "@/server/db/schema";
import { revalidatePath } from "next/cache";

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
