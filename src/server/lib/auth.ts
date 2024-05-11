import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { sendMail } from "./mailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";
import { env } from "@/common/env.mjs";
import { eq } from "drizzle-orm";
import { TRole, roles, users } from "../db/schema";
import { ROLES } from "@/common/constants";

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db) as never,
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier: to, url }) => {
        await sendMail({
          to,
          from: "auth",
          subject: "Authentication",
          html: `<a href="${url}" >Sign In</a>`,
        });
      },
    }),
  ],
  events: {
    createUser: async ({ user }) => {
      const role = await db.query.roles.findFirst({
        where: eq(roles.name, ROLES.MEMBER),
      });

      if (!role) {
        throw new Error("Role not found");
      }

      await db
        .update(users)
        .set({
          roleId: role.id,
        })
        .where(eq(users.id, user.id));
    },
  },
  callbacks: {
    jwt: async ({ user, token }) => {
      let id: string = "";

      if (user?.id) {
        id = user.id as string;
      }

      if (token?.id) {
        id = token.id as string;
      }

      const u = await db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
          role: true,
        },
      });

      if (!u) {
        throw new Error("User not found");
      }

      return u as typeof u & {
        role: TRole;
      };
    },
    session: ({ session, token }) => {
      // @ts-ignore
      session.user = token;

      return session;
    },
  },
};
