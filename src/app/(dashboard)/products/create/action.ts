"use server";

import { action, UnauthenticatedError } from "@/server/lib/action";
import { createProductSchema } from "./schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/lib/auth";
import { revalidatePath } from "next/cache";
import { productRepository } from "@/server/repositories/product";

export const createProductAction = action(
  createProductSchema,
  async (input) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new UnauthenticatedError();
    }

    await productRepository.create({
      name: input.name,
      price: input.price,
      description: input.description,

      // meta
      userId: session.user.id,
    });

    revalidatePath("/products");
  },
);
