"use server";

import {
  createCategorySchema,
  updateCategorySchema,
} from "@/common/schemas/category";
import { action, auth, TakenError } from "@/server/lib/action";
import { categoryRepository } from "@/server/repositories/category";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { categories } from "../db/schema";
import { businessRepository } from "../repositories/business";

const restoreCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreCategoryAction = action(
  restoreCategorySchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const category = await categoryRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (!category.deletedAt) {
      return;
    }

    await categoryRepository.restore(category.id, user.id);

    revalidatePath("/categories");
    revalidatePath(`/categories/${input.id}/edit`);
  },
);

export const createCategoryAction = action(
  createCategorySchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.name, input.name),
        eq(categories.businessId, business.id),
      ),
    });

    if (category) {
      throw new TakenError("Category");
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name: input.name,
        businessId: input.businessId,
      })
      .returning({
        id: categories.id,
      })
      .then((cats) => cats[0]);

    revalidatePath("/categories");
    revalidatePath("/dashboard");
    revalidatePath(`/categories/${newCategory.id}/edit`);
  },
);

export const updateCategoryAction = action(
  updateCategorySchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const category = await categoryRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (category.name === input.name) {
      return;
    }

    const categoryCheck = await db.query.categories.findFirst({
      where: and(
        eq(categories.businessId, business.id),
        eq(categories.name, input.name),
      ),
    });

    if (categoryCheck && categoryCheck.id !== input.id) {
      throw new TakenError("Category");
    }

    await categoryRepository.update(input.id, business.id, {
      name: input.name,
    });

    revalidatePath("/categories");
    revalidatePath(`/categories/${category.id}/edit`);
  },
);

const deleteCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteCategoryAction = action(
  deleteCategorySchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const category = await categoryRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (!category.deletedAt) {
      await categoryRepository.remove(input.id, business.id);
    } else {
      await categoryRepository.permRemove(input.id, business.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/categories");
    revalidatePath(`/categories/${category.id}/edit`);
  },
);
