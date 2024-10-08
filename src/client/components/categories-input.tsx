"use client";

import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import { getCategoriesAction } from "@/server/controllers/category";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

interface CategoriesInputProps {
  onValueChange: (value: string) => unknown;
  defaultValue?: string;
}

export const CategoriesInput: React.FC<CategoriesInputProps> = ({
  onValueChange,
  defaultValue,
}) => {
  const businessId = useParams().businessId;

  const [query, setQuery] = useState("");
  const { data, isSuccess } = useQuery({
    queryKey: ["categories", query],
    queryFn: async () => {
      if (typeof businessId !== "string") {
        throw new Error("Business not found");
      }

      const response = await getCategoriesAction({ businessId });

      if (response?.serverError) {
        throw new Error(response.serverError);
      }

      if (!response?.data) {
        throw new Error("Something went wrong");
      }

      return response.data;
    },
  });

  if (isSuccess) {
    return (
      <Combobox
        query={query}
        onQueryChange={setQuery}
        onValueChange={onValueChange}
        value={defaultValue}
        items={data.data.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
      />
    );
  }

  return <Skeleton className="h-10" />;
};
