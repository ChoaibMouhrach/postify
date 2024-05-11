import { getToken } from "next-auth/jwt";
import {
  NextMiddlewareWithAuth,
  NextRequestWithAuth,
  withAuth,
} from "next-auth/middleware";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES } from "./common/constants";

const schema = z.object({
  found: z.boolean(),
});

const getAuth = async (req: NextRequestWithAuth) => {
  const user = await getToken({ req });

  if (!user) {
    return null;
  }

  const { email } = user;

  const url = new URL("/api/auth/server-session-custom", req.url);

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  const validation = schema.safeParse(data);

  if (!validation.success) {
    return null;
  }

  const { found } = validation.data;

  if (!found) {
    return null;
  }

  return user;
};

const middleware: NextMiddlewareWithAuth = async (req) => {
  const user = await getAuth(req);
  const isGuestOnly = ["/sign-in"].includes(req.nextUrl.pathname);
  const isAdminOnly = ["/tasks"].includes(req.nextUrl.pathname);

  if (!user) {
    if (isGuestOnly) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isGuestOnly) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdminOnly && user.role.name !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
};

export default withAuth(middleware, {
  callbacks: {
    authorized: () => true,
  },
});
