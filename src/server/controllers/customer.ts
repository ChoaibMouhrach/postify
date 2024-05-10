"use server";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@/common/schemas/customer";
import {
  CustomError,
  TakenError,
  action,
  auth,
  rscAuth,
} from "@/server/lib/action";
import { customerRepository } from "@/server/repositories/customer";
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
import { db } from "../db";
import { customers } from "../db/schema";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { businessRepository } from "../repositories/business";

const indexSchema = z.object({
  businessId: z.string().uuid(),
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
  from: fromSchema,
  to: toSchema,
});

export const getCustomersAction = async (input: unknown) => {
  const { page, query, trash, from, to, businessId } = indexSchema.parse(input);

  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(businessId, user.id);

  const where = and(
    eq(customers.businessId, business.id),
    trash ? isNotNull(customers.deletedAt) : isNull(customers.deletedAt),
    from && to
      ? between(
          customers.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query
      ? or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.address, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(customers.phone, `%${query}%`),
        )
      : undefined,
  );

  const data = await db.query.customers.findMany({
    where,
    orderBy: desc(customers.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(customers)
    .then((recs) => parseInt(recs[0].count));

  const lastPage = Math.ceil(count / 8);

  return {
    data,
    page,
    lastPage,
    trash,
    query,
    from,
    to,
  };
};

const restoreCustomerSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreCustomerAction = action(
  restoreCustomerSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const customer = await customerRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (!customer.deletedAt) {
      throw new CustomError("Customer is not deleted");
    }

    await customerRepository.restore(customer.id, business.id);

    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.id}/edit`);
  },
);

export const createCustomerAction = action(
  createCustomerSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    if (input.email) {
      const customer = await db.query.customers.findFirst({
        where: and(
          eq(customers.businessId, business.id),
          eq(customers.email, input.email),
        ),
      });

      if (customer) {
        throw new TakenError("Customer");
      }
    }

    // todo: check phone number

    const customer = await customerRepository.create({
      name: input.name,
      email: input.email || undefined,
      phone: input.phone,
      address: input.address || undefined,
      businessId: business.id,
      code: input.code || null,
    });

    revalidatePath("/customers");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${customer.id}/edit`);
  },
);

const deleteCustomerSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteCustomerAction = action(
  deleteCustomerSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const customer = await customerRepository.findOrThrow(
      input.id,
      business.id,
    );

    await customerRepository.update(customer.id, business.id, {
      deletedAt: `NOW()`,
    });

    revalidatePath("/customers");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${customer.id}/edit`);
  },
);

export const updateCustomerAction = action(
  updateCustomerSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const customer = await customerRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (input.email) {
      const customerCheck = await db.query.customers.findFirst({
        where: and(
          eq(customers.email, input.email),
          eq(customers.businessId, business.id),
        ),
      });

      if (customerCheck && customerCheck.id !== customer.id) {
        throw new TakenError("Email address");
      }
    }

    const customerPhoneCheck = await db.query.customers.findFirst({
      where: and(
        eq(customers.phone, input.phone),
        eq(customers.businessId, business.id),
      ),
    });

    if (customerPhoneCheck && customerPhoneCheck.id !== customer.id) {
      throw new TakenError("Phone number");
    }

    await customerRepository.update(customer.id, business.id, {
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
      code: input.code || null,
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${input.id}/edit`);
  },
);
