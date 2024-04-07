import { getToken } from "next-auth/jwt";
import { NextMiddlewareWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const middleware: NextMiddlewareWithAuth = async (req) => {
  const isAuth = !!(await getToken({ req }));
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

  return NextResponse.next();
};

export default withAuth(middleware, {
  callbacks: {
    authorized: () => true,
  },
});
