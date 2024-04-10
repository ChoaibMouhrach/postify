import { getServerSession } from "next-auth";
import { createSafeActionClient, DEFAULT_SERVER_ERROR } from "next-safe-action";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export class CustomError extends Error {}

export class UnauthenticatedError extends CustomError {
  constructor() {
    super("Unauthenticated");
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
  handleReturnedServerError: (err) => {
    if (err instanceof CustomError) {
      return err.message;
    }

    return DEFAULT_SERVER_ERROR;
  },
});

export const auth = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new UnauthenticatedError();
  }

  return session.user;
};

export const rscAuth = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session.user;
};