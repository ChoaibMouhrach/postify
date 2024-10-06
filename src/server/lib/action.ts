import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { ROLES } from "@/common/constants";
import { validateRequest } from "./auth";
import { UserRepo } from "../repositories/user";
import { RoleRepo } from "../repositories/role";

export class CustomError extends Error {}

export class UnauthenticatedError extends CustomError {
  constructor() {
    super("Unauthenticated");
  }
}

export class ForbiddenError extends CustomError {
  constructor() {
    super("Forbidden");
  }
}

export class RequiredError extends CustomError {
  constructor(name: string) {
    super(`${name} is required`);
  }
}

export class NotfoundError extends CustomError {
  constructor(name: string) {
    super(`${name} not found`);
  }
}

export class TakenError extends CustomError {
  constructor(name: string) {
    super(`${name} is already taken`);
  }
}

export const action = createSafeActionClient({
  handleServerError: (err) => {
    if (err instanceof CustomError) {
      return err.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const protectedAction = action.use(async ({ next }) => {
  const { user } = await validateRequest();

  if (!user) {
    throw new UnauthenticatedError();
  }

  const role = await RoleRepo.findOrThrow(user.roleId);

  return await next({
    ctx: {
      authUser: {
        ...user,
        role: role.data,
      },
    },
  });
});

export const adminAction = protectedAction.use(async ({ next, ctx }) => {
  if (ctx.authUser.role.name !== ROLES.ADMIN) {
    throw new ForbiddenError();
  }

  return await next();
});
