"use server";

import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import {
  createProductSchema,
  updateProductSchema,
} from "@/common/schemas/product";
import { db } from "@/server/db";
import { productsTable } from "@/server/db/schema";
import { action, auth, NotfoundError, rscAuth } from "@/server/lib/action";
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
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BusinessesRepo } from "../repositories/business";
import { CategoryRepo } from "../repositories/category";
import { ProductRepo } from "../repositories/product";

const schema = z.object({
  category: z.boolean().default(false),
  businessId: z.string().uuid(),
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const getProductsAction = async (input: unknown) => {
  const { page, trash, query, from, to, businessId } = schema.parse(input);

  const user = await rscAuth();

  const business = await BusinessesRepo.findOrThrow({
    id: businessId,
    userId: user.id,
  });

  const where = and(
    eq(productsTable.businessId, business.data.id),
    trash
      ? isNotNull(productsTable.deletedAt)
      : isNull(productsTable.deletedAt),
    from && to
      ? between(
          productsTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query
      ? or(
          ilike(productsTable.name, `%${query}%`),
          ilike(productsTable.description, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.productsTable.findMany({
    where,
    orderBy: desc(productsTable.createdAt),
    limit: 8,
    offset: (page - 1) * 8,
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
    query,
    trash,
    from,
    to,

    // pagination
    page,
    lastPage,
  };
};

export const createProductAction = action
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    if (parsedInput.categoryId) {
      await CategoryRepo.findOrThrow({
        id: parsedInput.categoryId,
        businessId: business.data.id,
      });
    }

    const [product] = await ProductRepo.create([
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

    revalidatePath("/products");
    revalidatePath(`/dashboard`);
    revalidatePath(`/products/${product.data.id}/edit`);
  });

export const updateProductAction = action
  .schema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
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

    revalidatePath("/products");
    revalidatePath(`/products/${parsedInput.id}/edit`);
  });

const deleteProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteProductAction = action
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const product = await ProductRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (product.data.deletedAt) {
      await product.permRemove();
    } else {
      await product.remove();
    }

    revalidatePath("/products");
    revalidatePath(`/dashboard`);
    revalidatePath(`/products/${parsedInput.id}/edit`);
  });

const restoreProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreProductAction = action
  .schema(restoreProductSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
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

    revalidatePath("/products");
    revalidatePath(`/products/${product.data.id}/edit`);
  });
