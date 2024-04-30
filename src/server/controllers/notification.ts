"use server";

import { z } from "zod";
import { action, auth } from "../lib/action";
import { notificationRepository } from "../repositories/notification";
import { revalidatePath } from "next/cache";

const markAsReadSchema = z.object({
  id: z.string().uuid(),
});

export const markAsReadAction = action(markAsReadSchema, async (input) => {
  const user = await auth();

  const notification = await notificationRepository.findOrThrow(
    input.id,
    user.id,
  );

  await notificationRepository.update(notification.id, user.id, {
    read: true,
  });

  revalidatePath("/notifications");
});
