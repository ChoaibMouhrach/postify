"use server";

import {
  createProductSchema,
  updateProductSchema,
} from "@/common/schemas/product";
import { db } from "@/server/db";
import { productsTable } from "@/server/db/schema";
import { NotfoundError, protectedAction } from "@/server/lib/action";
import {
  and,
  between,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { BusinessesRepo } from "../repositories/business";
import { CategoryRepo } from "../repositories/category";
import { ProductRepo } from "../repositories/product";
import { businessIndexBaseSchema } from "@/common/schemas";

export const getProductsAction = protectedAction
  .schema(businessIndexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const where = and(
      eq(productsTable.businessId, business.data.id),
      parsedInput.trash
        ? isNotNull(productsTable.deletedAt)
        : isNull(productsTable.deletedAt),
      parsedInput.from && parsedInput.to
        ? between(
            productsTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,
      parsedInput.query
        ? or(
            ilike(productsTable.name, `%${parsedInput.query}%`),
            ilike(productsTable.description, `%${parsedInput.query}%`),
          )
        : undefined,
    );

    const dataPromise = db.query.productsTable.findMany({
      where,
      orderBy: desc(productsTable.createdAt),
      limit: 8,
      offset: (parsedInput.page - 1) * 8,
      with: {
        category: true,
      },
    });

    const countPromise = db
      .select({
        count: sql`COUTN(*)`.mapWith(Number),
      })
      .from(productsTable)
      .where(where);

    const [data, [{ count }]] = await Promise.all([dataPromise, countPromise]);

    const lastPage = Math.ceil(count / 8);

    return {
      // data
      data,
      business,

      // meta
      query: parsedInput.query,
      trash: parsedInput.trash,
      from: parsedInput.from,
      to: parsedInput.to,

      // pagination
      page: parsedInput.page,
      lastPage,
    };
  });

export const createProductAction = protectedAction
  .schema(createProductSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    if (parsedInput.categoryId) {
      await CategoryRepo.findOrThrow({
        id: parsedInput.categoryId,
        businessId: business.data.id,
      });
    }

    await ProductRepo.create([
      {
        // info
        businessId: business.data.id,
        price: parseFloat(String(parsedInput.price)),
        name: parsedInput.name,
        unit: parsedInput.unit,
        tax: parsedInput.tax,

        // optional
        description: parsedInput.description || null,
        categoryId: parsedInput.categoryId || null,
        code: parsedInput.code || null,
      },
    ]);
  });

export const updateProductAction = protectedAction
  .schema(updateProductSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const product = await ProductRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (parsedInput.categoryId) {
      await CategoryRepo.findOrThrow({
        id: parsedInput.categoryId,
        businessId: business.data.id,
      });
    }

    await ProductRepo.update(
      {
        id: product.data.id,
        businessId: business.data.id,
      },
      {
        name: parsedInput.name,
        price: parseFloat(String(parsedInput.price)),
        unit: parsedInput.unit,
        tax: parsedInput.tax,

        // optional
        description: parsedInput.description || null,
        categoryId: parsedInput.categoryId || null,
        code: parsedInput.code || null,
      },
    );
  });

const deleteProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteProductAction = protectedAction
  .schema(deleteProductSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const product = await ProductRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (product.data.deletedAt) {
      await product.permRemove();
      return;
    }

    await product.remove();
  });

const restoreProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreProductAction = protectedAction
  .schema(restoreProductSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const product = await ProductRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!product) {
      throw new NotfoundError("Product");
    }

    if (!product.data.deletedAt) {
      return;
    }

    await product.restore();
  });
