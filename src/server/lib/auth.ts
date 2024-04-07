import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { sendMail } from "./mailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";
import { env } from "@/common/env.mjs";
import { and, eq } from "drizzle-orm";
import { users } from "../db/schema";

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
    jwt: async ({ token, user }) => {
      if (user?.id) {
        const dbUser = await db.query.users.findFirst({
          where: and(eq(users.id, user.id)),
        });

        if (dbUser) {
          token = dbUser;
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      session.user = token;
      return session;
    },
  },
};
