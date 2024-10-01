"use server";

import { z } from "zod";
import { action, auth } from "../lib/action";
import { revalidatePath } from "next/cache";
import { NotificationRepo } from "../repositories/notification";

const markAsReadSchema = z.object({
  id: z.string().uuid(),
});

export const markAsReadAction = action
  .schema(markAsReadSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const notification = await NotificationRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    notification.data.read = true;

    await notification.save();

    revalidatePath("/notifications");
  });

export const markAllAsReadAction = action
  .schema(z.object({}))
  .action(async () => {
    const user = await auth();

    await NotificationRepo.readAll({
      userId: user.id,
    });

    revalidatePath("/notifications");
  });
