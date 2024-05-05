"use client";

import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import { getCategoriesAction } from "@/server/controllers/category";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

interface CategoriesInputProps {
  // eslint-disable-next-line no-unused-vars
  onValueChange: (value: string) => unknown;
}

export const CategoriesInput: React.FC<CategoriesInputProps> = ({
  onValueChange,
}) => {
  const businessId = useParams().businessId;

  const [query, setQuery] = useState("");
  const { data, isSuccess } = useQuery({
    queryKey: ["categories", query],
    queryFn: () => getCategoriesAction({ businessId }),
  });

  if (isSuccess) {
    return (
      <Combobox
        query={query}
        onQueryChange={setQuery}
        onValueChange={onValueChange}
        items={data.data.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
      />
    );
  }

  return <Skeleton className="h-10" />;
};
