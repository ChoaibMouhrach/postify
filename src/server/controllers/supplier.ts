"use server";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "@/common/schemas/supplier";
import { action, auth, TakenError } from "@/server/lib/action";
import { supplierRepository } from "@/server/repositories/supplier";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { suppliers } from "../db/schema";
import { RECORDS_LIMIT } from "@/common/constants";
import { and, eq, isNotNull, isNull, or, ilike, desc, sql } from "drizzle-orm";
import { rscAuth } from "../lib/action";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { z } from "zod";
import { SearchParams } from "@/types/nav";
import { redirect } from "next/navigation";

const schema = z.object({
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
});

export const getSuppliersAction = async (searchParams: SearchParams) => {
  const user = await rscAuth();

  const { page, query, trash } = schema.parse(searchParams);

  const where = and(
    eq(suppliers.userId, user.id),
    trash ? isNotNull(suppliers.deletedAt) : isNull(suppliers.deletedAt),
    query
      ? or(
          ilike(suppliers.name, `%${query}%`),
          ilike(suppliers.email, `%${query}%`),
          ilike(suppliers.phone, `%${query}%`),
          ilike(suppliers.address, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.suppliers.findMany({
    where,
    orderBy: desc(suppliers.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(suppliers)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return {
    data,
    page,
    lastPage,
    trash,
    query,
  };
};

const restoreSupplierSchema = z.object({
  id: z.string().uuid(),
});

export const restoreSupplierAction = action(
  restoreSupplierSchema,
  async (input) => {
    const user = await auth();
    await supplierRepository.findOrThrow(input.id, user.id);
    await supplierRepository.restore(input.id, user.id);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.id}/edit`);
  },
);

export const createSupplierAction = action(
  createSupplierSchema,
  async (input) => {
    const user = await auth();

    if (input.email) {
      const supplierCheck = await db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.email, input.email),
          eq(suppliers.userId, user.id),
        ),
      });

      if (supplierCheck) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliers.findFirst({
      where: and(
        eq(suppliers.phone, input.phone),
        eq(suppliers.userId, user.id),
      ),
    });

    if (supplierPhoneCheck) {
      throw new TakenError("Phone");
    }

    const supplier = await supplierRepository.create({
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
      userId: user.id,
    });

    revalidatePath("/suppliers");
    revalidatePath(`/dashboard`);
    revalidatePath(`/suppliers/${supplier.id}/edit`);
  },
);

const deleteSupplierSchema = z.object({
  id: z.string().uuid(),
});

export const deleteSupplierAction = action(
  deleteSupplierSchema,
  async (input) => {
    const user = await auth();
    const supplier = await supplierRepository.findOrThrow(input.id, user.id);

    if (supplier.deletedAt) {
      await supplierRepository.permRemove(input.id, user.id);
    } else {
      await supplierRepository.remove(input.id, user.id);
    }

    revalidatePath("/suppliers");
    revalidatePath(`/dashboard`);
    revalidatePath(`/suppliers/${input.id}/edit`);
    redirect("/suppliers");
  },
);

export const updateSupplierAction = action(
  updateSupplierSchema,
  async (input) => {
    const user = await auth();

    await supplierRepository.findOrThrow(input.id, user.id);

    if (input.email) {
      const supplierEmailCheck = await db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.email, input.email),
          eq(suppliers.userId, user.id),
        ),
      });

      if (supplierEmailCheck && supplierEmailCheck.id !== input.id) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliers.findFirst({
      where: and(
        eq(suppliers.phone, input.phone),
        eq(suppliers.userId, user.id),
      ),
    });

    if (supplierPhoneCheck && supplierPhoneCheck.id !== input.id) {
      throw new TakenError("Phone");
    }

    await supplierRepository.update(input.id, user.id, {
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.id}/edit`);
  },
);
