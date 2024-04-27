"use server";

import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import {
  createProductSchema,
  updateProductSchema,
} from "@/common/schemas/product";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { action, auth, NotfoundError, rscAuth } from "@/server/lib/action";
import { productRepository } from "@/server/repositories/product";
import { SearchParams } from "@/types/nav";
import { and, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
});

export const getProductsAction = async (searchParams: SearchParams) => {
  const user = await rscAuth();

  const { page, trash, query } = schema.parse(searchParams);

  const where = and(
    eq(products.userId, user.id),
    trash ? isNotNull(products.deletedAt) : isNull(products.deletedAt),
    query
      ? or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
        )
      : undefined,
  );

  const data = await db.query.products.findMany({
    where,
    orderBy: desc(products.createdAt),
    limit: 8,
    offset: (page - 1) * 8,
  });

  const count = await productRepository.count(where);

  const lastPage = Math.ceil(count / 8);

  return {
    data,
    page,
    query,
    trash,
    lastPage,
  };
};

export const createProductAction = action(
  createProductSchema,
  async (input) => {
    const user = await auth();

    const product = await productRepository.create({
      name: input.name,
      price: input.price,
      description: input.description,

      // meta
      userId: user.id,
    });

    revalidatePath("/products");
    revalidatePath(`/dashboard`);
    revalidatePath(`/products/${product.id}/edit`);
  },
);

export const updateProductAction = action(
  updateProductSchema,
  async (input) => {
    const user = await auth();

    await productRepository.findOrThrow(input.id, user.id);

    await productRepository.update(input.id, user.id, {
      name: input.name,
      price: input.price,
      description: input.description || null,
      userId: user.id,
    });

    revalidatePath("/products");
    revalidatePath(`/products/${input.id}/edit`);
  },
);

const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export const deleteProductAction = action(
  deleteProductSchema,
  async (input) => {
    const user = await auth();

    const product = await productRepository.findOrThrow(input.id, user.id);

    if (product.deletedAt) {
      await productRepository.permRemove(product.id, user.id);
    } else {
      await productRepository.remove(product.id, user.id);
    }

    revalidatePath("/products");
    revalidatePath(`/dashboard`);
    revalidatePath(`/products/${input.id}/edit`);
  },
);

const restoreProductSchema = z.object({
  id: z.string().uuid(),
});

export const restoreProductAction = action(
  restoreProductSchema,
  async (input) => {
    const user = await auth();

    const product = await db.query.products.findFirst({
      where: and(eq(products.userId, user.id), eq(products.id, input.id)),
    });

    if (!product) {
      throw new NotfoundError("Product");
    }

    if (!product.deletedAt) {
      return;
    }

    await productRepository.restore(input.id, user.id);

    revalidatePath("/products");
    revalidatePath(`/products/${product.id}/edit`);
  },
);
