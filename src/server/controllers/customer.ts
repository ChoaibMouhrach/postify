"use server";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@/common/schemas/customer";
import { CustomError, TakenError, protectedAction } from "@/server/lib/action";
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
import { db } from "../db";
import { customersTable } from "../db/schema";
import { businessIndexBaseSchema } from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { BusinessesRepo } from "../repositories/business";
import { redirect } from "next/navigation";
import { CustomerRepo } from "../repositories/customer";

export const getCustomersAction = protectedAction
  .schema(businessIndexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.find({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    if (!business) {
      redirect("/businesses");
    }

    const where = and(
      eq(customersTable.businessId, business.data.id),
      parsedInput.trash
        ? isNotNull(customersTable.deletedAt)
        : isNull(customersTable.deletedAt),
      parsedInput.from && parsedInput.to
        ? between(
            customersTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,
      parsedInput.query
        ? or(
            ilike(customersTable.name, `%${parsedInput.query}%`),
            ilike(customersTable.address, `%${parsedInput.query}%`),
            ilike(customersTable.email, `%${parsedInput.query}%`),
            ilike(customersTable.phone, `%${parsedInput.query}%`),
          )
        : undefined,
    );

    const dataPromise = db.query.customersTable.findMany({
      where,
      orderBy: desc(customersTable.createdAt),
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
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
      page: parsedInput.page,
      lastPage,
      trash: parsedInput.trash,
      query: parsedInput.query,
      from: parsedInput.from,
      to: parsedInput.to,
    };
  });

const restoreCustomerSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restoreCustomerAction = protectedAction
  .schema(restoreCustomerSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const customer = await CustomerRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!customer.data.deletedAt) {
      throw new CustomError("Customer is not deleted");
    }

    await customer.restore();
  });

export const createCustomerAction = protectedAction
  .schema(createCustomerSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
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
    await CustomerRepo.create([
      {
        name: parsedInput.name,
        email: parsedInput.email || undefined,
        phone: parsedInput.phone,
        address: parsedInput.address || undefined,
        businessId: business.data.id,
        code: parsedInput.code || null,
      },
    ]);
  });

const deleteCustomerSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deleteCustomerAction = protectedAction
  .schema(deleteCustomerSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
    });

    const customer = await CustomerRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    customer.data.deletedAt = `NOW()`;

    await customer.save();
  });

export const updateCustomerAction = protectedAction
  .schema(updateCustomerSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const business = await BusinessesRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: authUser.id,
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
  });
