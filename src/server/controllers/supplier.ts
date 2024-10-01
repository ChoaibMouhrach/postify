"use server";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "@/common/schemas/supplier";
import { action, auth, rscAuth, TakenError } from "@/server/lib/action";
import { SupplierRepo } from "@/server/repositories/supplier";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { suppliersTable } from "../db/schema";
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
  between,
} from "drizzle-orm";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { z } from "zod";
import { BusinessesRepo } from "../repositories/business";
import { redirect } from "next/navigation";

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

  const user = await rscAuth();

  const business = await BusinessesRepo.find({
    id: businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/suppliers");
  }

  const where = and(
    eq(suppliersTable.businessId, business.data.id),
    trash
      ? isNotNull(suppliersTable.deletedAt)
      : isNull(suppliersTable.deletedAt),
    from && to
      ? between(
          suppliersTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query
      ? or(
          ilike(suppliersTable.name, `%${query}%`),
          ilike(suppliersTable.email, `%${query}%`),
          ilike(suppliersTable.phone, `%${query}%`),
          ilike(suppliersTable.address, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.suppliersTable.findMany({
    where,
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
    orderBy: desc(suppliersTable.createdAt),
  });

  const countPromise = db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
    })
    .from(suppliersTable)
    .where(where)
    .then((recs) => recs[0].count);

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

export const restoreSupplierAction = action
  .schema(restoreSupplierSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const supplier = await SupplierRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    await SupplierRepo.restore({
      id: supplier.data.id,
      businessId: business.data.id,
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${parsedInput.id}/edit`);
  });

export const createSupplierAction = action
  .schema(createSupplierSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    if (parsedInput.email) {
      const supplierCheck = await db.query.suppliersTable.findFirst({
        where: and(
          eq(suppliersTable.email, parsedInput.email),
          eq(suppliersTable.businessId, business.data.id),
        ),
      });

      if (supplierCheck) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliersTable.findFirst({
      where: and(
        eq(suppliersTable.phone, parsedInput.phone),
        eq(suppliersTable.businessId, user.id),
      ),
    });

    if (supplierPhoneCheck) {
      throw new TakenError("Phone");
    }

    const [supplier] = await SupplierRepo.create([
      {
        name: parsedInput.name,
        phone: parsedInput.phone,
        email: parsedInput.email || null,
        address: parsedInput.address || null,
        businessId: business.data.id,
      },
    ]);

    revalidatePath("/suppliers");
    revalidatePath(`/dashboard`);
    revalidatePath(`/suppliers/${supplier.data.id}/edit`);
  });

const deleteSupplierSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteSupplierAction = action
  .schema(deleteSupplierSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const supplier = await SupplierRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (supplier.data.deletedAt) {
      await supplier.permRemove();
    } else {
      await supplier.remove();
    }

    revalidatePath("/suppliers");
    revalidatePath(`/dashboard`);
  });

export const updateSupplierAction = action
  .schema(updateSupplierSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const supplier = await SupplierRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (parsedInput.email) {
      const supplierEmailCheck = await db.query.suppliersTable.findFirst({
        where: and(
          eq(suppliersTable.email, parsedInput.email),
          eq(suppliersTable.businessId, business.data.id),
        ),
      });

      if (supplierEmailCheck && supplierEmailCheck.id !== supplier.data.id) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliersTable.findFirst({
      where: and(
        eq(suppliersTable.phone, parsedInput.phone),
        eq(suppliersTable.businessId, business.data.id),
      ),
    });

    if (supplierPhoneCheck && supplierPhoneCheck.id !== supplier.data.id) {
      throw new TakenError("Phone");
    }

    await SupplierRepo.update(
      {
        id: supplier.data.id,
        businessId: business.data.id,
      },
      {
        name: parsedInput.name,
        email: parsedInput.email || null,
        phone: parsedInput.phone,
        address: parsedInput.address || null,
      },
    );

    revalidatePath("/suppliers");
  });
