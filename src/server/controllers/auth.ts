"use server";

import { updateAuthSchema } from "@/common/schemas/auth";
import { action, auth } from "../lib/action";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { revalidatePath } from "next/cache";

export const updateAuthAction = action
  .schema(updateAuthSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    await db
      .update(users)
      .set({ name: parsedInput.name || null })
      .where(eq(users.email, user.email));

    revalidatePath("/settings");
  });
