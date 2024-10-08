"use client";

import {
  FormItem,
  FormDescription,
  FormMessage,
  FormLabel,
  FormField,
  FormControl,
} from "@/client/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getSuppliersAction } from "@/server/controllers/supplier";
import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useCallback, useState } from "react";
import debounce from "debounce";

interface SupplierInputProps {
  onValueChange: (supplierId: string) => void;
  value: string;
  businessId: string;
}

export const SupplierInput: React.FC<SupplierInputProps> = ({
  businessId,
  value,
  onValueChange,
}) => {
  const [query, setQuery] = useState("");
  const { data, error, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["suppliers", query],
    queryFn: async () => {
      const response = await getSuppliersAction({ query, businessId });

      if (response?.serverError) {
        throw new Error(response.serverError);
      }

      if (!response?.data) {
        throw new Error("Something went wrong");
      }

      return response.data;
    },
    placeholderData: (ph) => ph,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeQuery = useCallback(
    debounce((value: string) => {
      setQuery(value);
    }, 500),
    [],
  );

  const setSupplierId = (value: string) => {
    onValueChange(value);
  };

  return (
    <FormField
      name="supplierId"
      render={() => (
        <FormItem>
          <FormLabel>Supplier</FormLabel>
          <FormControl>
            {isSuccess && (
              <Combobox
                value={value}
                query={query}
                onQueryChange={changeQuery}
                onValueChange={setSupplierId}
                items={data.data.map((supplier) => ({
                  label: supplier.name,
                  value: supplier.id,
                }))}
              />
            )}
            {isLoading && <Skeleton className="h-10" />}
            {isError && error.message}
          </FormControl>
          <FormDescription>The supplier for this purchase.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
