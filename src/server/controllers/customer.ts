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
import { customersTable } from "../db/schema";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { BusinessesRepo } from "../repositories/business";
import { redirect } from "next/navigation";
import { CustomerRepo } from "../repositories/customer";

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

  const business = await BusinessesRepo.find({
    id: businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

  const where = and(
    eq(customersTable.businessId, business.data.id),
    trash
      ? isNotNull(customersTable.deletedAt)
      : isNull(customersTable.deletedAt),
    from && to
      ? between(
          customersTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query
      ? or(
          ilike(customersTable.name, `%${query}%`),
          ilike(customersTable.address, `%${query}%`),
          ilike(customersTable.email, `%${query}%`),
          ilike(customersTable.phone, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.customersTable.findMany({
    where,
    orderBy: desc(customersTable.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
    })
    .from(customersTable);

  const [data, [{ count }]] = await Promise.all([dataPromise, countPromise]);

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

export const restoreCustomerAction = action
  .schema(restoreCustomerSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const customer = await CustomerRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!customer.data.deletedAt) {
      throw new CustomError("Customer is not deleted");
    }

    await customer.restore();

    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.data.id}/edit`);
  });

export const createCustomerAction = action
  .schema(createCustomerSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    if (parsedInput.email) {
      const customer = await CustomerRepo.findByEmail({
        email: parsedInput.email,
        businessId: business.data.id,
      });

      if (customer) {
        throw new TakenError("Customer");
      }
    }

    // todo: check phone number

    const [newCustomer] = await CustomerRepo.create([
      {
        name: parsedInput.name,
        email: parsedInput.email || undefined,
        phone: parsedInput.phone,
        address: parsedInput.address || undefined,
        businessId: business.data.id,
        code: parsedInput.code || null,
      },
    ]);

    revalidatePath("/customers");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${newCustomer.data.id}/edit`);
  });

const deleteCustomerSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteCustomerAction = action
  .schema(deleteCustomerSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const customer = await CustomerRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    customer.data.deletedAt = `NOW()`;

    await customer.save();

    revalidatePath("/customers");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${customer.data.id}/edit`);
  });

export const updateCustomerAction = action
  .schema(updateCustomerSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const customer = await CustomerRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (parsedInput.email) {
      const customerCheck = await db.query.customersTable.findFirst({
        where: and(
          eq(customersTable.email, parsedInput.email),
          eq(customersTable.businessId, business.data.id),
        ),
      });

      if (customerCheck && customerCheck.id !== customer.data.id) {
        throw new TakenError("Email address");
      }
    }

    const customerPhoneCheck = await db.query.customersTable.findFirst({
      where: and(
        eq(customersTable.phone, parsedInput.phone),
        eq(customersTable.businessId, business.data.id),
      ),
    });

    if (customerPhoneCheck && customerPhoneCheck.id !== customer.data.id) {
      throw new TakenError("Phone number");
    }

    customer.data.name = parsedInput.name;
    customer.data.email = parsedInput.email || null;
    customer.data.phone = parsedInput.phone;
    customer.data.address = parsedInput.address || null;
    customer.data.code = parsedInput.code || null;

    await customer.save();

    revalidatePath("/customers");
    revalidatePath(`/customers/${parsedInput.id}/edit`);
  });
