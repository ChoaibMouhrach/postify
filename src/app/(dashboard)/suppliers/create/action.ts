"use server";

import { TakenError, action, auth } from "@/server/lib/action";
import { createSupplierSchema } from "./schema";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { suppliers } from "@/server/db/schema";
import { supplierRepository } from "@/server/repositories/supplier";
import { revalidatePath } from "next/cache";

export const createSupplierAction = action(
  createSupplierSchema,
  async (input) => {
    const user = await auth();

    if (input.email) {
      const supplierCheck = await db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.email, input.email),
          eq(suppliers.userId, user.id),
        ),
      });

      if (supplierCheck) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliers.findFirst({
      where: and(
        eq(suppliers.phone, input.phone),
        eq(suppliers.userId, user.id),
      ),
    });

    if (supplierPhoneCheck) {
      throw new TakenError("Phone");
    }

    await supplierRepository.create({
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
      userId: user.id,
    });

    revalidatePath("/suppliers");
  },
);
