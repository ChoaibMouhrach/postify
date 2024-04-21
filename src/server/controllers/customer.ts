"use server";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@/common/schemas/customer";
import { CustomError, TakenError, action, auth } from "@/server/lib/action";
import { customerRepository } from "@/server/repositories/customer";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { customers } from "../db/schema";

const restoreCustomerSchema = z.object({
  id: z.string().uuid(),
});

export const restoreCustomerAction = action(
  restoreCustomerSchema,
  async (input) => {
    const user = await auth();

    const customer = await customerRepository.findOrThrow(input.id, user.id);

    if (!customer.deletedAt) {
      throw new CustomError("Customer is not deleted");
    }

    await customerRepository.restore(input.id, user.id);

    revalidatePath("/customers");
    revalidatePath(`/customers/${input.id}/edit`);
  },
);

export const createCustomerAction = action(
  createCustomerSchema,
  async (input) => {
    const user = await auth();

    if (input.email) {
      const customer = await db.query.customers.findFirst({
        where: and(
          eq(customers.userId, user.id),
          eq(customers.email, input.email),
        ),
      });

      if (customer) {
        throw new TakenError("Customer");
      }
    }

    await customerRepository.create({
      name: input.name,
      email: input.email || undefined,
      phone: input.phone,
      address: input.address || undefined,
      userId: user.id,
    });

    revalidatePath("/customers");
    redirect("/customers");
  },
);

const deleteCustomerSchema = z.object({
  id: z.string().uuid(),
});

export const deleteCustomerAction = action(
  deleteCustomerSchema,
  async (input) => {
    const user = await auth();

    await customerRepository.findOrThrow(input.id, user.id);

    await customerRepository.update(input.id, user.id, { deletedAt: `NOW()` });

    revalidatePath("/customers");
    revalidatePath(`/customers/${input.id}/edit`, "page");
  },
);

export const updateCustomerAction = action(
  updateCustomerSchema,
  async (input) => {
    const user = await auth();

    await customerRepository.findOrThrow(input.id, user.id);

    if (input.email) {
      const customerCheck = await db.query.customers.findFirst({
        where: and(
          eq(customers.email, input.email),
          eq(customers.userId, user.id),
        ),
      });

      if (customerCheck && customerCheck.id !== input.id) {
        throw new TakenError("Email address");
      }
    }

    const customerPhoneCheck = await db.query.customers.findFirst({
      where: and(
        eq(customers.phone, input.phone),
        eq(customers.userId, user.id),
      ),
    });

    if (customerPhoneCheck && customerPhoneCheck.id !== input.id) {
      throw new TakenError("Phone number");
    }

    await customerRepository.update(input.id, user.id, {
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${input.id}/edit`);
  },
);
