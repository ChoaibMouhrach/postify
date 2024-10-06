import { env } from "@/common/env.mjs";
import { User } from "lucia";
import { TRole } from "../db/schema";

export const publicRoutes = ["/403", "/500", "/404", "/setup"];

export const isPublicRoute = (pathname: string): boolean => {
  return !!publicRoutes.find((route) => pathname.startsWith(route));
};

export const guestRoutes = ["/sign-in"];

export const isGuestRoute = (pathname: string): boolean => {
  return !!guestRoutes.find((route) => pathname.startsWith(route));
};

export const protectedRoutes = [
  "/dashboard",
  "/businesses",
  "/notifications",
  "/settings",
  "/businesses/[]/dashboard",
  "/businesses/[]/categories",
  "/businesses/[]/customers",
  "/businesses/[]/dashboard",
  "/businesses/[]/orders",
  "/businesses/[]/products",
  "/businesses/[]/purchases",
  "/businesses/[]/settings",
  "/businesses/[]/suppliers",
];

export const isProtectedRoute = (pathname: string): boolean => {
  return !!guestRoutes.find((route) => {
    const pathnameSegments = pathname
      .replaceAll(/\/+/g, "/")
      .split("/")
      .filter((segment, index, segments) => {
        return !(
          (index === 0 && !segment) ||
          (index === segments.length - 1 && !segment)
        );
      });

    const routeSegments = route
      .replaceAll(/\/+/g, "/")
      .split("/")
      .filter((segment, index, segments) => {
        return !(
          (index === 0 && !segment) ||
          (index === segments.length - 1 && !segment)
        );
      });

    if (routeSegments.length !== pathnameSegments.length) {
      return false;
    }

    return routeSegments.every((routeSegment, index) => {
      return routeSegment === "[]" || pathnameSegments[index] === routeSegment;
    });
  });
};

export const getAuth = async (cookie: string) => {
  try {
    const response = await fetch(
      new URL("/api/auth/profile", env.NEXTAUTH_URL),
      {
        headers: {
          cookie,
        },
      },
    );

    if (!response.ok) {
      let status = response.status;
      let message = response.statusText;
      let data: any;

      try {
        const responseData = (await response.json()) as { error?: string };

        data = responseData;

        if (responseData.error) {
          message = responseData.error;
        }
      } catch {}

      throw new ApiError(status, message, data);
    }

    return (await response.json()) as User & { role: TRole };
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error) {
      throw new ApiError(500, err.message);
    }

    throw new ApiError(500, "Something went wrong");
  }
};

export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  public constructor(status: number, message: string, data?: unknown) {
    super();
    this.status = status;
    this.data = data;
  }
}

export const getSetup = async (): Promise<boolean> => {
  try {
    const response = await fetch(new URL("/api/auth/setup", env.NEXTAUTH_URL));

    if (!response.ok) {
      let status = response.status;
      let message = response.statusText;
      let data: any;

      try {
        let responseData = (await response.json()) as { error?: string };
        data = responseData;
        if (responseData.error) {
          message = responseData.error;
        }
      } catch {}

      throw new ApiError(status, message, data);
    }

    return (await response.json()) as boolean;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error) {
      throw new ApiError(500, err.message);
    }

    throw new ApiError(500, "Unexpected error");
  }
};
