"use server";

import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import {
  action,
  NotfoundError,
  UnauthenticatedError,
} from "@/server/lib/action";
import { authOptions } from "@/server/lib/auth";
import { productRepository } from "@/server/repositories/product";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const restoreProductSchema = z.object({
  id: z.string().uuid(),
});

const auth = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new UnauthenticatedError();
  }

  return session.user;
};

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
