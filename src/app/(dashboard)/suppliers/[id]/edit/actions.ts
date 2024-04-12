"use server";

import { TakenError, action, auth } from "@/server/lib/action";
import { supplierRepository } from "@/server/repositories/supplier";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateSupplierSchema } from "./schema";
import { and, eq } from "drizzle-orm";
import { suppliers } from "@/server/db/schema";
import { db } from "@/server/db";

const deleteSupplierSchema = z.object({
  id: z.string().uuid(),
});

export const deleteSupplierAction = action(
  deleteSupplierSchema,
  async (input) => {
    const user = await auth();
    const supplier = await supplierRepository.findOrThrow(input.id, user.id);

    if (supplier.deletedAt) {
      await supplierRepository.permRemove(input.id, user.id);
    } else {
      await supplierRepository.remove(input.id, user.id);
    }

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.id}/edit`);
  },
);

export const updateSupplierAction = action(
  updateSupplierSchema,
  async (input) => {
    const user = await auth();

    await supplierRepository.findOrThrow(input.id, user.id);

    if (input.email) {
      const supplierEmailCheck = await db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.email, input.email),
          eq(suppliers.userId, user.id),
        ),
      });

      if (supplierEmailCheck && supplierEmailCheck.id !== input.id) {
        throw new TakenError("Email address");
      }
    }

    const supplierPhoneCheck = await db.query.suppliers.findFirst({
      where: and(
        eq(suppliers.phone, input.phone),
        eq(suppliers.userId, user.id),
      ),
    });

    if (supplierPhoneCheck && supplierPhoneCheck.id !== input.id) {
      throw new TakenError("Phone");
    }

    await supplierRepository.update(input.id, user.id, {
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      address: input.address || null,
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.id}/edit`);
  },
);
