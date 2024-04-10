"use server";

import { TakenError, action, auth } from "@/server/lib/action";
import { customerRepository } from "@/server/repositories/customer";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateCustomerSchema } from "./schema";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { customers } from "@/server/db/schema";

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
