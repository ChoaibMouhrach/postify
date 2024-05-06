"use client";

import {
  FormItem,
  FormDescription,
  FormMessage,
  FormLabel,
  FormField,
  FormControl,
} from "@/client/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getSuppliersAction } from "@/server/controllers/supplier";
import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useCallback, useState } from "react";
import debounce from "debounce";
import { Payload } from "./edit";

interface SupplierInputProps {
  form: UseFormReturn<Payload, any, undefined>;
  businessId: string;
}

export const SupplierInput: React.FC<SupplierInputProps> = ({
  form,
  businessId,
}) => {
  const [query, setQuery] = useState("");
  const { data, isSuccess } = useQuery({
    queryKey: ["suppliers", query],
    queryFn: () => getSuppliersAction({ query, businessId }),
    placeholderData: (ph) => ph,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeQuery = useCallback(
    debounce((value: string) => {
      setQuery(value);
    }, 500),
    [],
  );

  const onValueChange = (value: string) => {
    form.setValue("supplierId", value);
  };

  return (
    <FormField
      name="supplierId"
      render={() => (
        <FormItem>
          <FormLabel>Supplier</FormLabel>
          <FormControl>
            {isSuccess ? (
              <Combobox
                query={query}
                value={form.getValues("supplierId")}
                onQueryChange={changeQuery}
                onValueChange={onValueChange}
                items={data.data.map((supplier) => ({
                  label: supplier.name,
                  value: supplier.id,
                }))}
              />
            ) : (
              <Skeleton className="h-10" />
            )}
          </FormControl>
          <FormDescription>The supplier for this purchase.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
