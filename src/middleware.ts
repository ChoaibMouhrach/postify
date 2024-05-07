import { getToken } from "next-auth/jwt";
import { NextMiddlewareWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLES } from "./common/constants";

const ADMIN_PATHS = ["/tasks"];

const middleware: NextMiddlewareWithAuth = async (req) => {
  const user = await getToken({ req });
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
