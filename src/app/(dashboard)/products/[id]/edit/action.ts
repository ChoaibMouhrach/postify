"use server";

import { action, auth } from "@/server/lib/action";
import { productRepository } from "@/server/repositories/product";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateProductSchema } from "./schema";

const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export const deleteProductAction = action(
  deleteProductSchema,
  async (input) => {
    const user = await auth();

    const product = await productRepository.findOrThrow(input.id, user.id);

    await productRepository.remove(product.id, user.id);

    revalidatePath("/products");
    revalidatePath(`/products/${input.id}/edit`);
  },
);

export const updateProductAction = action(
  updateProductSchema,
  async (input) => {
    const user = await auth();

    await productRepository.findOrThrow(input.id, user.id);

    await productRepository.update(input.id, user.id, {
      name: input.name,
      price: input.price,
      description: input.description || null,
      userId: user.id,
    });

    revalidatePath("/products");
    revalidatePath(`/products/${input.id}/edit`);
  },
);
