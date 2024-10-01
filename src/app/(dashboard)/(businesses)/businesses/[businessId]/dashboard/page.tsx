import React from "react";
import { Cards } from "./cards";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { Charts } from "./charts";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await BusinessesRepo.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  return (
    <>
      <Cards businessId={business.id} />
      <Charts businessId={business.id} />
    </>
  );
};

export default Page;
