import React from "react";
import { Cards } from "./cards";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { Charts } from "./charts";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

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
