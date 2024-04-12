"use server";

import { action, auth } from "@/server/lib/action";
import { supplierRepository } from "@/server/repositories/supplier";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const restoreSupplierSchema = z.object({
  id: z.string().uuid(),
});

export const restoreSupplierAction = action(
  restoreSupplierSchema,
  async (input) => {
    const user = await auth();
    await supplierRepository.findOrThrow(input.id, user.id);
    await supplierRepository.restore(input.id, user.id);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.id}/edit`);
  },
);
