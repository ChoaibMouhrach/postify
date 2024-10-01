"use server";

import {
  createCategorySchema,
  updateCategorySchema,
} from "@/common/schemas/category";
import { action, auth, rscAuth, TakenError } from "@/server/lib/action";
import {
  and,
  between,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { categoriesTable } from "../db/schema";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { BusinessRepo } from "../repositories/business";
import { redirect } from "next/navigation";
import { CategoryRepo } from "../repositories/category";

const schema = z.object({
  businessId: z.string().uuid(),
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const getCategoriesAction = async (input: unknown) => {
  const { page, query, trash, from, to, businessId } = schema.parse(input);

  const user = await rscAuth();

  const business = await BusinessRepo.find({
    id: businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

  const where = and(
    eq(categoriesTable.businessId, business.data.id),
    trash
      ? isNotNull(categoriesTable.deletedAt)
      : isNull(categoriesTable.deletedAt),
    from && to
      ? between(
          categoriesTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query ? or(ilike(categoriesTable.name, `%${query}%`)) : undefined,
  );

  const dataPromise = db.query.categoriesTable.findMany({
    where,
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(categoriesTable)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return {
    // data
    data,

    // meta
    trash,
    query,
    from,
    to,

    // pagination
    page,
    lastPage,
  };
};

const restoreCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreCategoryAction = action
  .schema(restoreCategorySchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const category = await CategoryRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!category.data.deletedAt) {
      return;
    }

    await category.restore();

    revalidatePath("/categories");
    revalidatePath(`/categories/${parsedInput.id}/edit`);
  });

export const createCategoryAction = action
  .schema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const category = await CategoryRepo.findByName({
      name: parsedInput.name,
      businessId: business.data.id,
    });

    if (category) {
      throw new TakenError("Category");
    }

    const [newCategory] = await CategoryRepo.create([
      {
        name: parsedInput.name,
        businessId: parsedInput.businessId,
      },
    ]);

    revalidatePath("/categories");
    revalidatePath("/dashboard");
    revalidatePath(`/categories/${newCategory.data.id}/edit`);
  });

export const updateCategoryAction = action
  .schema(updateCategorySchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const category = await CategoryRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (category.data.name === parsedInput.name) {
      return;
    }

    const categoryCheck = await CategoryRepo.findByName({
      name: category.data.name,
      businessId: business.data.id,
    });

    if (categoryCheck && categoryCheck.data.id !== parsedInput.id) {
      throw new TakenError("Category");
    }

    category.data.name = parsedInput.name;
    await category.save();

    revalidatePath("/categories");
    revalidatePath(`/categories/${category.data.id}/edit`);
  });

const deleteCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteCategoryAction = action
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const category = await CategoryRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!category.data.deletedAt) {
      await category.remove();
    } else {
      await category.permRemove();
    }

    revalidatePath("/dashboard");
    revalidatePath("/categories");
    revalidatePath(`/categories/${category.data.id}/edit`);
  });
