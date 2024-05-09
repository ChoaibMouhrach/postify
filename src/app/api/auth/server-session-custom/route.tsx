import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const payload = schema.parse(body);

  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  return NextResponse.json({
    found: !!user,
  });
};
