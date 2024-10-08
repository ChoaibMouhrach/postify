"use server";

import { UserRepo } from "../repositories/user";
import { generateIdFromEntropySize } from "lucia";
import { signInSchema, updateAuthSchema } from "@/common/schemas/auth";
import { action, protectedAction } from "../lib/action";
import { env } from "@/common/env";
import { lucia } from "../lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleRepo } from "../repositories/role";
import {
  ORDER_TYPES,
  ROLES,
  TASK_STATUSES,
  TASK_TYPES,
  VARIABLES,
} from "@/common/constants";
import { db } from "../db";
import { inArray } from "drizzle-orm";
import { orderTypes, rolesTable, taskStatuses, taskTypes } from "../db/schema";
import { randomUUID } from "crypto";
import { VariableRepo } from "../repositories/variable";

export const signInAction = action
  .schema(signInSchema)
  .action(async ({ parsedInput }) => {
    let user = await UserRepo.findByEmail(parsedInput.email);

    if (!user) {
      const role = await RoleRepo.findByNameOrThrow(ROLES.MEMBER);

      const [newUser] = await UserRepo.create([
        {
          id: generateIdFromEntropySize(10),
          email: parsedInput.email,
          roleId: role.data.id,
        },
      ]);

      user = newUser;
    }

    // create token
    const { token } = await user.createMagicToken();

    // preprare url
    const url = new URL(
      `/api/auth?token=${token}`,
      env.NEXTAUTH_URL,
    ).toString();

    // send email
    await user.mail.mail({
      from: "auth",
      subject: "Authentication",
      html: `<a href="${url}" >Sign In</a>`,
    });
  });

export const signOutAction = protectedAction.action(
  async ({ ctx: { authSession } }) => {
    await lucia.invalidateSession(authSession.id);
    const sessionCookie = lucia.createBlankSessionCookie();

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/sign-in");
  },
);

export const updateAuthAction = protectedAction
  .schema(updateAuthSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = new UserRepo(ctx.authUser);
    user.data.name = parsedInput.name || null;
    await user.save();
  });

export const setupAction = action.action(async () => {
  // task types
  const types = [TASK_TYPES.BUG, TASK_TYPES.FEATURE];

  const ts = await db.query.taskTypes.findMany({
    where: inArray(taskTypes.name, types),
  });

  if (ts.length !== types.length) {
    await db.insert(taskTypes).values(
      types.map((type) => ({
        name: type,
      })),
    );
  }

  // task statuses
  const status = [
    TASK_STATUSES.NOT_STARTED,
    TASK_STATUSES.IN_PROGRESS,
    TASK_STATUSES.DONE,
  ];

  const st = await db.query.taskStatuses.findMany({
    where: inArray(taskStatuses.name, status),
  });

  if (st.length !== status.length) {
    await db.insert(taskStatuses).values(
      status.map((state) => {
        const id = randomUUID();

        return {
          id,
          name: state,
        };
      }),
    );
  }

  // roles
  const cr = [ROLES.MEMBER, ROLES.ADMIN];

  const rs = await db.query.rolesTable.findMany({
    where: inArray(rolesTable.name, cr),
  });

  if (rs.length !== cr.length) {
    await db.insert(rolesTable).values(cr.map((name) => ({ name })));
  }

  // order types
  const orderTypesArr = [ORDER_TYPES.CUSTOMER, ORDER_TYPES.WALKING_CUSTOMER];

  const orderTypesDB = await db.query.orderTypes.findMany({
    where: inArray(orderTypes.name, orderTypesArr),
  });

  if (ts.length !== orderTypesDB.length) {
    await db.insert(orderTypes).values(
      orderTypesArr.map((name) => ({
        name,
      })),
    );
  }

  await VariableRepo.upsert({
    key: VARIABLES.setup,
    value: "true",
  });
});
