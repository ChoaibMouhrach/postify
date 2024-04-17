"use server";

import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { action, auth, TakenError } from "@/server/lib/action";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createCategorySchema } from "./schema";

export const createCategoryAction = action(
  createCategorySchema,
  async (input) => {
    const user = await auth();

    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.name, input.name),
        eq(categories.userId, user.id),
      ),
    });

    if (category) {
      throw new TakenError("Category");
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name: input.name,
        userId: user.id,
      })
      .returning({
        id: categories.id,
      })
      .then((cats) => cats[0]);

    revalidatePath("/categories");
    revalidatePath(`/categories/${newCategory.id}/edit`);
  },
);
