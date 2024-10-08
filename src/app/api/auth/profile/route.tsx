import { validateRequest } from "@/server/lib/auth";
import { RoleRepo } from "@/server/repositories/role";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json(
        {},
        {
          status: 401,
        },
      );
    }

    const role = await RoleRepo.findOrThrow(user.roleId);

    return NextResponse.json({ ...user, role });
  } catch {
    return NextResponse.json(
      {},
      {
        status: 401,
      },
    );
  }
};
