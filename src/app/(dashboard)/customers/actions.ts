"use server";

import { CustomError, action, auth } from "@/server/lib/action";
import { customerRepository } from "@/server/repositories/customer";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
