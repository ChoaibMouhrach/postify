"use server";

import {
  createCategorySchema,
  updateCategorySchema,
} from "@/common/schemas/category";
import { action, auth, rscAuth, TakenError } from "@/server/lib/action";
import { categoryRepository } from "@/server/repositories/category";
import {
  and,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { categories } from "../db/schema";
import { businessRepository } from "../repositories/business";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";

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

  const business = await businessRepository.rscFindOrThrow(businessId, user.id);

  const where = and(
    eq(categories.businessId, business.id),
    trash ? isNotNull(categories.deletedAt) : isNull(categories.deletedAt),
    from || to
      ? and(
          from
            ? gte(categories.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            categories.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query ? or(ilike(categories.name, `%${query}%`)) : undefined,
  );

  const dataPromise = db.query.categories.findMany({
    where,
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(categories)
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
