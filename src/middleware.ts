import { getToken } from "next-auth/jwt";
import {
  NextMiddlewareWithAuth,
  NextRequestWithAuth,
  withAuth,
} from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLES } from "./common/constants";
import { env } from "./common/env.mjs";
import { z } from "zod";
import { cookies } from "next/headers";

const ADMIN_PATHS = ["/tasks"];

const schema = z.object({
  found: z.boolean(),
});

const getAuth = async (req: NextRequestWithAuth) => {
  const user = await getToken({ req });

  if (!user) {
    return null;
  }

  const c = cookies();

  const response = await fetch(
    new URL("/api/auth/server-session-custom", env.NEXTAUTH_URL).toString(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: c
          .getAll()
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; "),
      },
      body: JSON.stringify({
        email: user.email,
      }),
    },
  );

  const body = await response.json();

  const { found } = schema.parse(body);

  if (!found) {
    return null;
  }

  return user;
};

const middleware: NextMiddlewareWithAuth = async (req) => {
  const user = await getAuth(req);
  const isAuth = !!user;
  const isGuestOnly = ["/sign-in"].includes(req.nextUrl.pathname);

  if (isGuestOnly) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", req.url).toString());
    }

    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/sign-in", req.url).toString());
  }

  for (let path of ADMIN_PATHS) {
    if (
      req.nextUrl.pathname.startsWith(path) &&
      user.role.name !== ROLES.ADMIN
    ) {
      return NextResponse.redirect(new URL("/403", req.url).toString());
    }
  }

  return NextResponse.next();
};

export default withAuth(middleware, {
  callbacks: {
    authorized: () => true,
  },
});
