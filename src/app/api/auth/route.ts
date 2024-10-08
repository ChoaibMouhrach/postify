import { UserRepo } from "@/server/repositories/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const token = request.nextUrl.searchParams.get("token");

  // check token provided
  if (!token) {
    redirect("/403?message=Token not provided");
  }

  // get magic token
  const magicToken = await UserRepo.findMagicToken(token);

  // check token's existance
  if (!magicToken) {
    redirect("/403?message=Token not found");
  }

  // check token expired
  if (magicToken.expiresAt < new Date()) {
    redirect("/403?message=token expired");
  }

  // remove token
  await magicToken.user.removeMagicToken(token);

  // create new session
  let session = await magicToken.user.createSession();

  // set session
  cookies().set(session.name, session.value, session.attributes);

  // redirect to dashboard
  redirect("/dashboard");
};
