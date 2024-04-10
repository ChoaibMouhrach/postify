"use server";

import { TakenError, action, auth } from "@/server/lib/action";
import { createCustomerSchema } from "./schema";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { customers } from "@/server/db/schema";
import { customerRepository } from "@/server/repositories/customer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
