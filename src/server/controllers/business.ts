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
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
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
import { businesses } from "../db/schema";
import { businessRepository } from "../repositories/business";
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
    eq(businesses.userId, user.id),
    trash ? isNotNull(businesses.deletedAt) : isNull(businesses.deletedAt),
    from || to
      ? and(
          from
            ? gte(businesses.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            businesses.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query
      ? or(
          ilike(businesses.name, `%${query}%`),
          ilike(businesses.email, `%${query}%`),
          ilike(businesses.phone, `%${query}%`),
          ilike(businesses.address, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.businesses.findMany({
    where,
    orderBy: desc(businesses.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(businesses)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

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

export const createBusinessAction = action(
  createBusinessSchema,
  async (input) => {
    const user = await auth();

    if (input.email) {
      const business = await db.query.businesses.findFirst({
        where: and(
          eq(businesses.email, input.email),
          eq(businesses.userId, user.id),
        ),
      });

      if (business) {
        throw new TakenError("Business email address");
      }
    }

    await businessRepository.create({
      name: input.name,
      phone: input.phone,
      currency: input.currency,
      email: input.email || null,
      address: input.address || null,
      userId: user.id,
    });

    revalidatePath("/businesses");
    revalidatePath("/");
  },
);

export const updateBusinessAction = action(
  updateBusinessSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(input.id, user.id);

    if (input.email) {
      const businessByEmail = await db.query.businesses.findFirst({
        where: and(
          eq(businesses.email, input.email),
          eq(businesses.userId, user.id),
        ),
      });

      if (businessByEmail && businessByEmail.id !== business.id) {
        throw new TakenError("Business email address");
      }
    }

    await businessRepository.update(business.id, user.id, {
      name: input.name,
      phone: input.phone,
      currency: input.currency,
      email: input.email || null,
      address: input.address || null,
    });

    revalidatePath("/businesses");
  },
);

const deleteBusinessSchema = z.object({
  id: z.string().uuid(),
});

export const deleteBusinessAction = action(
  deleteBusinessSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(input.id, user.id);

    if (business.deletedAt) {
      await businessRepository.permRemove(business.id, user.id);
    } else {
      await businessRepository.remove(business.id, user.id);
    }

    revalidatePath("/");
    revalidatePath("/business");
  },
);

const restoreBusinessSchema = z.object({
  id: z.string().uuid(),
});

export const restoreBusinessAction = action(
  restoreBusinessSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(input.id, user.id);

    if (business.deletedAt) {
      await businessRepository.restore(business.id, user.id);
    }

    revalidatePath("/");
    revalidatePath("/business");
  },
);
