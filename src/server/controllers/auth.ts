"use server";

import { UserRepo } from "../repositories/user";
import { generateIdFromEntropySize } from "lucia";
import { signInSchema, updateAuthSchema } from "@/common/schemas/auth";
import { action, protectedAction } from "../lib/action";
import { env } from "@/common/env.mjs";
import { lucia } from "../lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleRepo } from "../repositories/role";
import { ROLES } from "@/common/constants";

export const signIn = action
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

export const signOut = protectedAction.action(async ({ ctx: { authUser } }) => {
  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/sign-in");
});

export const updateAuthAction = protectedAction
  .schema(updateAuthSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = new UserRepo(ctx.authUser);
    user.data.name = parsedInput.name || null;
    await user.save();
  });
