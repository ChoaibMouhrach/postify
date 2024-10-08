import { NextMiddleware, NextResponse } from "next/server";
import {
  ApiError,
  getAuth,
  getSetup,
  isGuestRoute,
  isProtectedRoute,
  isPublicRoute,
} from "./utils";
import { ROLES } from "@/common/constants";
import { env } from "@/common/env";
import { cookies } from "next/headers";

export const middleware: NextMiddleware = async (request) => {
  const pathname = request.nextUrl.pathname;

  let setup;

  try {
    setup = await getSetup();
  } catch (err) {
    if (err instanceof ApiError) {
      let url = new URL("/500", env.NEXTAUTH_URL);
      url.searchParams.set("message", err.message);
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(new URL("/500", env.NEXTAUTH_URL));
  }

  if (setup && pathname === "/setup") {
    return NextResponse.redirect(new URL("/sign-in", env.NEXTAUTH_URL));
  }

  if (!setup && pathname !== "/setup") {
    return NextResponse.redirect(new URL("/setup", env.NEXTAUTH_URL));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", env.NEXTAUTH_URL));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  let cookie = request.headers.get("cookie");

  if (!cookie && pathname === "/sign-in") {
    return NextResponse.next();
  }

  if (!cookie && pathname !== "/sign-in") {
    return NextResponse.redirect(new URL("/sign-in", env.NEXTAUTH_URL));
  }

  if (!cookie) {
    return NextResponse.redirect(new URL("/sign-in", env.NEXTAUTH_URL));
  }

  let user;

  try {
    user = await getAuth(cookie);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        cookies().delete("auth-session");
      }

      let url = new URL("/500", env.NEXTAUTH_URL);
      url.searchParams.set("message", err.message);
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(new URL("/500", env.NEXTAUTH_URL));
  }

  if (isGuestRoute(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", env.NEXTAUTH_URL));
    }

    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL("/403", env.NEXTAUTH_URL));
  }

  if (isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (user.role.name !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL("/403", env.NEXTAUTH_URL));
  }

  return NextResponse.next();
};
