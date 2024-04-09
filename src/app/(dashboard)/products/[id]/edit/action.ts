"use server";

import {
  action,
  NotfoundError,
  UnauthenticatedError,
} from "@/server/lib/action";
import { authOptions } from "@/server/lib/auth";
import { productRepository } from "@/server/repositories/product";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export const deleteProductAction = action(
  deleteProductSchema,
  async (input) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new UnauthenticatedError();
    }

    const product = await productRepository.find(input.id, session.user.id);

    if (!product) {
      throw new NotfoundError("Product");
    }

    await productRepository.remove(product.id, session.user.id);

    revalidatePath("/products");
    revalidatePath(`/products/${input.id}/edit`);
  },
);
