import React from "react";
import { Cards } from "./cards";
import { BusinessesRepo } from "@/server/repositories/business";
import { Charts } from "./charts";
import { redirect } from "next/navigation";
import { validateRequest } from "@/server/lib/auth";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const business = await BusinessesRepo.find({
    id: params.businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

  return (
    <>
      <Cards businessId={business.data.id} />
      <Charts businessId={business.data.id} />
    </>
  );
};

export default Page;
