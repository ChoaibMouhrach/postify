import { VARIABLES } from "@/common/constants";
import { VariableRepo } from "@/server/repositories/variable";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  const setup = await VariableRepo.findByKey(VARIABLES.setup);
  return NextResponse.json(!!(setup?.data.value === "true"));
};
