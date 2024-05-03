"use server";

import { createBusinessSchema } from "@/common/schemas/business";
import { TakenError, action, auth } from "../lib/action";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { businesses } from "../db/schema";
import { businessRepository } from "../repositories/business";
import { revalidatePath } from "next/cache";

export const createBusinessAction = action(
  createBusinessSchema,
  async (input) => {
    const user = await auth();

    if (input.email) {
      const business = await db.query.businesses.findFirst({
        where: and(
          eq(businesses.email, input.email),
          eq(businesses.userId, user.id),
        ),
      });

      if (business) {
        throw new TakenError("Business email address");
      }
    }

    const businessByPhone = await db.query.businesses.findFirst({
      where: and(
        eq(businesses.phone, input.phone),
        eq(businesses.userId, user.id),
      ),
    });

    if (businessByPhone) {
      throw new TakenError("Business phone number");
    }

    await businessRepository.create({
      name: input.name,
      phone: input.phone,
      currency: input.currency,
      email: input.email || null,
      address: input.address || null,
      userId: user.id,
    });

    revalidatePath("/products");
  },
);
