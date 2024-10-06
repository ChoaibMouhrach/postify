"use server";

import {
  createCategorySchema,
  updateCategorySchema,
} from "@/common/schemas/category";
import { protectedAction, TakenError } from "@/server/lib/action";
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
import { z } from "zod";
import { db } from "../db";
import { categoriesTable } from "../db/schema";
import { businessIndexBaseSchema } from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { BusinessesRepo } from "../repositories/business";
import { redirect } from "next/navigation";
import { CategoryRepo } from "../repositories/category";

export const getCategoriesAction = protectedAction
  .schema(businessIndexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.find({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    if (!business) {
      redirect("/businesses");
    }

    const where = and(
      eq(categoriesTable.businessId, business.data.id),
      parsedInput.trash
        ? isNotNull(categoriesTable.deletedAt)
        : isNull(categoriesTable.deletedAt),
      parsedInput.from && parsedInput.to
        ? between(
            categoriesTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,
      parsedInput.query
        ? or(ilike(categoriesTable.name, `%${parsedInput.query}%`))
        : undefined,
    );

    const dataPromise = db.query.categoriesTable.findMany({
      where,
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
    });

    const countPromise = db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(categoriesTable)
      .where(where)
      .then((recs) => recs[0].count);

    const [data, count] = await Promise.all([dataPromise, countPromise]);

    const lastPage = Math.ceil(count / RECORDS_LIMIT);

    return {
      // data
      data,

      // meta
      trash: parsedInput.trash,
      query: parsedInput.query,
      from: parsedInput.from,
      to: parsedInput.to,

      // pagination
      page: parsedInput.page,
      lastPage,
    };
  });

const restoreCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreCategoryAction = protectedAction
  .schema(restoreCategorySchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const category = await CategoryRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!category.data.deletedAt) {
      return;
    }

    await category.restore();
  });

export const createCategoryAction = protectedAction
  .schema(createCategorySchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const category = await CategoryRepo.findByName({
      name: parsedInput.name,
      businessId: business.data.id,
    });

    if (category) {
      throw new TakenError("Category");
    }

    await CategoryRepo.create([
      {
        name: parsedInput.name,
        businessId: parsedInput.businessId,
      },
    ]);
  });

export const updateCategoryAction = protectedAction
  .schema(updateCategorySchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
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
  });

const deleteCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteCategoryAction = protectedAction
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const category = await CategoryRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!category.data.deletedAt) {
      await category.remove();
      return;
    }
    await category.permRemove();
  });
