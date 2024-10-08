import { NextResponse } from "next/server";
import { VARIABLES } from "@/common/constants";
import { VariableRepo } from "@/server/repositories/variable";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const setup = await VariableRepo.findByKey(VARIABLES.setup);
  return NextResponse.json(!!(setup?.data.value === "true"));
};
