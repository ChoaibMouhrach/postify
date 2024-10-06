"use server";

import { z } from "zod";
import { protectedAction } from "../lib/action";
import { NotificationRepo } from "../repositories/notification";

const markAsReadSchema = z.object({
  id: z.string().uuid(),
});

export const markAsReadAction = protectedAction
  .schema(markAsReadSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const notification = await NotificationRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    notification.data.read = true;

    await notification.save();
  });

export const markAllAsReadAction = protectedAction
  .schema(z.object({}))
  .action(async ({ ctx: { authUser } }) => {
    await NotificationRepo.readAll({
      userId: authUser.id,
    });
  });
