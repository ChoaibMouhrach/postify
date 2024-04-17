"use server";

import { action, auth, TakenError } from "@/server/lib/action";
import { categoryRepository } from "@/server/repositories/category";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateCategorySchema } from "./schema";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { categories } from "@/server/db/schema";

export const updateCategoryAction = action(
  updateCategorySchema,
  async (input) => {
    const user = await auth();

    const category = await categoryRepository.findOrThrow(input.id, user.id);

    if (category.name === input.name) {
      return;
    }

    const categoryCheck = await db.query.categories.findFirst({
      where: and(
        eq(categories.userId, user.id),
        eq(categories.name, input.name),
      ),
    });

    if (categoryCheck && categoryCheck.id !== input.id) {
      throw new TakenError("Category");
    }

    await categoryRepository.update(input.id, user.id, {
      name: input.name,
    });

    revalidatePath("/categories");
    revalidatePath(`/categories/${category.id}/edit`);
  },
);

const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});

export const deleteCategoryAction = action(
  deleteCategorySchema,
  async (input) => {
    const user = await auth();

    await categoryRepository.findOrThrow(input.id, user.id);
    await categoryRepository.remove(input.id, user.id);

    revalidatePath("/categories");
  },
);
