"use server";

import { RECORDS_LIMIT } from "@/common/constants";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { rscAuth } from "@/server/lib/action";
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
import { TakenError, action, auth } from "../lib/action";
import { db } from "../db";
import { businessesTable } from "../db/schema";
import { BusinessesRepo } from "../repositories/business";
import { revalidatePath } from "next/cache";

const indexSchema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const getBusinessesAction = async (input: unknown) => {
  const { page, query, trash, from, to } = indexSchema.parse(input);

  const user = await rscAuth();

  const where = and(
    eq(businessesTable.userId, user.id),
    trash
      ? isNotNull(businessesTable.deletedAt)
      : isNull(businessesTable.deletedAt),
    from && to
      ? between(
          businessesTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query
      ? or(
          ilike(businessesTable.name, `%${query}%`),
          ilike(businessesTable.email, `%${query}%`),
          ilike(businessesTable.phone, `%${query}%`),
          ilike(businessesTable.address, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.businessesTable.findMany({
    where,
    orderBy: desc(businessesTable.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
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
    query,
    trash,
    from,
    to,

    // pagination
    page,
    lastPage,
  };
};

export const createBusinessAction = action
  .schema(createBusinessSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    if (parsedInput.email) {
      const business = await BusinessesRepo.findByEmail({
        email: parsedInput.email,
        userId: user.id,
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
        userId: user.id,
      },
    ]);
  });

export const updateBusinessAction = action
  .schema(updateBusinessSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    if (parsedInput.email) {
      const businessByEmail = await BusinessesRepo.findByEmail({
        email: parsedInput.email,
        userId: user.id,
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

    revalidatePath("/businesses");
  });

const deleteBusinessSchema = z.object({
  id: z.string().uuid(),
});

export const deleteBusinessAction = action
  .schema(deleteBusinessSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    if (business.data.deletedAt) {
      await business.permRemove();
    } else {
      await business.remove();
    }

    revalidatePath("/");
    revalidatePath("/business");
  });

const restoreBusinessSchema = z.object({
  id: z.string().uuid(),
});

export const restoreBusinessAction = action
  .schema(restoreBusinessSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    if (business.data.deletedAt) {
      await business.restore();
    }

    revalidatePath("/");
    revalidatePath("/business");
  });
