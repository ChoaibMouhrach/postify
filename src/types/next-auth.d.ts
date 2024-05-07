import { TRole, TUser } from "@/server/db/schema";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: TUser & { role: TRole } & DefaultSession["user"];
  }

  // eslint-disable-next-line no-unused-vars
  interface User {}
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line no-unused-vars
  type JWT = TUser & {
    role: TRole;
  };
}
