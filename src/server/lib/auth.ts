import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { sendMail } from "./mailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";
import { env } from "@/common/env.mjs";
import { eq } from "drizzle-orm";
import { roles, users } from "../db/schema";
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
  callbacks: {
    signIn: async (params) => {
      if (!params.user.email) {
        return false;
      }

      const user = await db.query.users.findFirst({
        where: eq(users.email, params.user.email),
      });

      if (user) {
        return true;
      }

      const role = await db.query.roles.findFirst({
        where: eq(roles.name, ROLES.MEMBER),
      });

      if (!role) {
        return false;
      }

      await db.insert(users).values({
        name: params.user.name,
        image: params.user.image,
        email: params.user.email!,
        roleId: role.id,
      });

      return true;
    },
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

      return u;
    },
    session: ({ session, token }) => {
      session.user = token;

      return session;
    },
  },
};
