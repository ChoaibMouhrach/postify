"use server";

import { db } from "@/server/db";
import { purchases } from "@/server/db/schema";
import { action, auth } from "@/server/lib/action";
import { purchaseRepository } from "@/server/repositories/purchase";
import { eq } from "drizzle-orm";
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
