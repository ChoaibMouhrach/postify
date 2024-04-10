"use server";

import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { action, auth, NotfoundError } from "@/server/lib/action";
import { productRepository } from "@/server/repositories/product";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const restoreProductSchema = z.object({
  id: z.string().uuid(),
});

export const restoreProductAction = action(
  restoreProductSchema,
  async (input) => {
    const user = await auth();

    const product = await db.query.products.findFirst({
      where: and(eq(products.userId, user.id), eq(products.id, input.id)),
    });

    if (!product) {
      throw new NotfoundError("Product");
    }

    if (!product.deletedAt) {
      return;
    }

    await productRepository.restore(input.id, user.id);
    revalidatePath("/products");
    revalidatePath(`/products/${product.id}/edit`);
  },
);
