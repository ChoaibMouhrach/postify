"use server";

import { RECORDS_LIMIT } from "@/common/constants";
import { indexBaseSchema } from "@/common/schemas";
import { protectedAction } from "@/server/lib/action";
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
import {
  createBusinessSchema,
  updateBusinessSchema,
} from "@/common/schemas/business";
import { TakenError } from "../lib/action";
import { db } from "../db";
import { businessesTable } from "../db/schema";
import { BusinessesRepo } from "../repositories/business";

export const getBusinessesAction = protectedAction
  .schema(indexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const where = and(
      eq(businessesTable.userId, authUser.id),
      parsedInput.trash
        ? isNotNull(businessesTable.deletedAt)
        : isNull(businessesTable.deletedAt),
      parsedInput.from && parsedInput.to
        ? between(
            businessesTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,
      parsedInput.query
        ? or(
            ilike(businessesTable.name, `%${parsedInput.query}%`),
            ilike(businessesTable.email, `%${parsedInput.query}%`),
            ilike(businessesTable.phone, `%${parsedInput.query}%`),
            ilike(businessesTable.address, `%${parsedInput.query}%`),
          )
        : undefined,
    );

    const dataPromise = db.query.businessesTable.findMany({
      where,
      orderBy: desc(businessesTable.createdAt),
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
    });

    const countPromise = db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(businessesTable)
      .where(where)
      .then((recs) => recs[0].count);

    const [data, count] = await Promise.all([dataPromise, countPromise]);

    const lastPage = Math.ceil(count / RECORDS_LIMIT);

    return {
      data,

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

export const createBusinessAction = protectedAction
  .schema(createBusinessSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    if (parsedInput.email) {
      const business = await BusinessesRepo.findByEmail({
        email: parsedInput.email,
        userId: authUser.id,
      });

      if (business) {
        throw new TakenError("Business email address");
      }
    }

    await BusinessesRepo.create([
      {
        name: parsedInput.name,
        phone: parsedInput.phone,
        currency: parsedInput.currency,
        email: parsedInput.email || null,
        address: parsedInput.address || null,
        code: parsedInput.code || null,
        userId: authUser.id,
      },
    ]);
  });

export const updateBusinessAction = protectedAction
  .schema(updateBusinessSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    if (parsedInput.email) {
      const businessByEmail = await BusinessesRepo.findByEmail({
        email: parsedInput.email,
        userId: authUser.id,
      });

      if (businessByEmail && businessByEmail.data.id !== business.data.id) {
        throw new TakenError("Business email address");
      }
    }

    business.data.name = parsedInput.name;
    business.data.phone = parsedInput.phone;
    business.data.currency = parsedInput.currency;
    business.data.email = parsedInput.email || null;
    business.data.address = parsedInput.address || null;
    business.data.code = parsedInput.code || null;

    await business.save();
  });

const deleteBusinessSchema = z.object({
  id: z.string().uuid(),
});

export const deleteBusinessAction = protectedAction
  .schema(deleteBusinessSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    if (business.data.deletedAt) {
      await business.permRemove();
      return;
    }

    await business.remove();
  });

const restoreBusinessSchema = z.object({
  id: z.string().uuid(),
});

export const restoreBusinessAction = protectedAction
  .schema(restoreBusinessSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    if (business.data.deletedAt) {
      await business.restore();
    }
  });
