import { TRole, TUser } from "@/server/db/schema";

interface T extends TUser {
  role: TRole;
}

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: T;
  }

  // eslint-disable-next-line no-unused-vars
  interface User extends T {}
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line no-unused-vars
  interface JWT extends T {}
}
