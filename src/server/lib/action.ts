import { createSafeActionClient, DEFAULT_SERVER_ERROR } from "next-safe-action";

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

export const action = createSafeActionClient({
  handleReturnedServerError: (err) => {
    if (err instanceof CustomError) {
      return err.message;
    }

    return DEFAULT_SERVER_ERROR;
  },
});
