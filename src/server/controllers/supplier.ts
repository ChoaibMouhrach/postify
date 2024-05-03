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
import {
  and,
  eq,
  isNotNull,
  isNull,
  or,
  ilike,
  desc,
  sql,
  lte,
  gte,
} from "drizzle-orm";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { z } from "zod";
import { businessRepository } from "../repositories/business";

const schema = z.object({
  businessId: z.string().uuid(),
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
  from: fromSchema,
  to: toSchema,
});

export const getSuppliersAction = async (input: unknown) => {
  const { page, query, trash, from, to, businessId } = schema.parse(input);

  const where = and(
    eq(suppliers.businessId, businessId),
    trash ? isNotNull(suppliers.deletedAt) : isNull(suppliers.deletedAt),
    from || to
      ? and(
          from
            ? gte(suppliers.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            suppliers.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
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

const restoreSupplierSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreSupplierAction = action(
  restoreSupplierSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const supplier = await supplierRepository.findOrThrow(
      input.id,
      business.id,
    );

    await supplierRepository.restore(supplier.id, business.id);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.id}/edit`);
  },
);

export const createSupplierAction = action(
  createSupplierSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    if (input.email) {
      const supplierCheck = await db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.email, input.email),
          eq(suppliers.businessId, business.id),
        ),
      });

      if (supplierCheck) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliers.findFirst({
      where: and(
        eq(suppliers.phone, input.phone),
        eq(suppliers.businessId, user.id),
      ),
    });

    if (supplierPhoneCheck) {
      throw new TakenError("Phone");
    }

    const supplier = await supplierRepository.create({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      address: input.address || null,
      businessId: business.id,
    });

    revalidatePath("/suppliers");
    revalidatePath(`/dashboard`);
    revalidatePath(`/suppliers/${supplier.id}/edit`);
  },
);

const deleteSupplierSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteSupplierAction = action(
  deleteSupplierSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const supplier = await supplierRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (supplier.deletedAt) {
      await supplierRepository.permRemove(input.id, business.id);
    } else {
      await supplierRepository.remove(input.id, business.id);
    }

    revalidatePath("/suppliers");
    revalidatePath(`/dashboard`);
  },
);

export const updateSupplierAction = action(
  updateSupplierSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const supplier = await supplierRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (input.email) {
      const supplierEmailCheck = await db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.email, input.email),
          eq(suppliers.businessId, business.id),
        ),
      });

      if (supplierEmailCheck && supplierEmailCheck.id !== supplier.id) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliers.findFirst({
      where: and(
        eq(suppliers.phone, input.phone),
        eq(suppliers.businessId, business.id),
      ),
    });

    if (supplierPhoneCheck && supplierPhoneCheck.id !== supplier.id) {
      throw new TakenError("Phone");
    }

    await supplierRepository.update(supplier.id, business.id, {
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
    });

    revalidatePath("/suppliers");
  },
);
