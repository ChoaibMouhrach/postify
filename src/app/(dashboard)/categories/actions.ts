"use server";

import { action, auth } from "@/server/lib/action";
import { categoryRepository } from "@/server/repositories/category";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const restoreCategorySchema = z.object({
  id: z.string().uuid(),
});

export const restoreCategoryAction = action(
  restoreCategorySchema,
  async (input) => {
    const user = await auth();

    await categoryRepository.findOrThrow(input.id, user.id);
    await categoryRepository.restore(input.id, user.id);

    revalidatePath("/categories");
    revalidatePath(`/categories/${input.id}/edit`);
  },
);
