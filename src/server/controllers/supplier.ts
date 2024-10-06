"use server";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "@/common/schemas/supplier";
import { protectedAction, TakenError } from "@/server/lib/action";
import { SupplierRepo } from "@/server/repositories/supplier";
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
import { z } from "zod";
import { BusinessesRepo } from "../repositories/business";
import { redirect } from "next/navigation";
import { businessIndexBaseSchema } from "@/common/schemas";

export const getSuppliersAction = protectedAction
  .schema(businessIndexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.find({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    if (!business) {
      redirect("/suppliers");
    }

    const where = and(
      eq(suppliersTable.businessId, business.data.id),
      parsedInput.trash
        ? isNotNull(suppliersTable.deletedAt)
        : isNull(suppliersTable.deletedAt),
      parsedInput.from && parsedInput.to
        ? between(
            suppliersTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,
      parsedInput.query
        ? or(
            ilike(suppliersTable.name, `%${parsedInput.query}%`),
            ilike(suppliersTable.email, `%${parsedInput.query}%`),
            ilike(suppliersTable.phone, `%${parsedInput.query}%`),
            ilike(suppliersTable.address, `%${parsedInput.query}%`),
          )
        : undefined,
    );

    const dataPromise = db.query.suppliersTable.findMany({
      where,
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
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
      trash: parsedInput.trash,
      query: parsedInput.query,
      from: parsedInput.from,
      to: parsedInput.to,
      // pagination
      page: parsedInput.page,
      lastPage,
    };
  });

const restoreSupplierSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreSupplierAction = protectedAction
  .schema(restoreSupplierSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const supplier = await SupplierRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    await SupplierRepo.restore({
      id: supplier.data.id,
      businessId: business.data.id,
    });
  });

export const createSupplierAction = protectedAction
  .schema(createSupplierSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
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
        eq(suppliersTable.businessId, authUser.id),
      ),
    });

    if (supplierPhoneCheck) {
      throw new TakenError("Phone");
    }

    await SupplierRepo.create([
      {
        name: parsedInput.name,
        phone: parsedInput.phone,
        email: parsedInput.email || null,
        address: parsedInput.address || null,
        businessId: business.data.id,
      },
    ]);
  });

const deleteSupplierSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteSupplierAction = protectedAction
  .schema(deleteSupplierSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const supplier = await SupplierRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (supplier.data.deletedAt) {
      await supplier.permRemove();
      return;
    }

    await supplier.remove();
  });

export const updateSupplierAction = protectedAction
  .schema(updateSupplierSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
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
  });
