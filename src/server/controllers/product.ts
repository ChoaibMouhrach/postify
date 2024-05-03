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
import { products } from "@/server/db/schema";
import { action, auth, NotfoundError, rscAuth } from "@/server/lib/action";
import { productRepository } from "@/server/repositories/product";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { businessRepository } from "../repositories/business";

const schema = z.object({
  businessId: z.string().uuid(),
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const getProductsAction = async (searchParams: unknown) => {
  const { page, trash, query, from, to, businessId } =
    schema.parse(searchParams);

  const user = await rscAuth();

  const business = await businessRepository.findOrThrow(businessId, user.id);

  const where = and(
    eq(products.businessId, business.id),
    trash ? isNotNull(products.deletedAt) : isNull(products.deletedAt),
    from || to
      ? and(
          from
            ? gte(products.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            products.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
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
    from,
    to,
  };
};

export const createProductAction = action(
  createProductSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const product = await productRepository.create({
      name: input.name,
      price: input.price,
      description: input.description,
      businessId: business.id,
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

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const product = await productRepository.findOrThrow(input.id, business.id);

    await productRepository.update(product.id, business.id, {
      name: input.name,
      price: input.price,
      description: input.description || null,
    });

    revalidatePath("/products");
    revalidatePath(`/products/${input.id}/edit`);
  },
);

const deleteProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteProductAction = action(
  deleteProductSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const product = await productRepository.findOrThrow(input.id, business.id);

    if (product.deletedAt) {
      await productRepository.permRemove(product.id, business.id);
    } else {
      await productRepository.remove(product.id, business.id);
    }

    revalidatePath("/products");
    revalidatePath(`/dashboard`);
    revalidatePath(`/products/${input.id}/edit`);
  },
);

const restoreProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreProductAction = action(
  restoreProductSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const product = await productRepository.findOrThrow(input.id, business.id);

    if (!product) {
      throw new NotfoundError("Product");
    }

    if (!product.deletedAt) {
      return;
    }

    await productRepository.restore(input.id, business.id);

    revalidatePath("/products");
    revalidatePath(`/products/${product.id}/edit`);
  },
);
