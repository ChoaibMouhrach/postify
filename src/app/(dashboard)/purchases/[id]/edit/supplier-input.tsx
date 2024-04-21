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
import { getSuppliersAction } from "@/server/controllers/suppliers";
import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useCallback, useState } from "react";
import debounce from "debounce";
import { Payload } from "./edit";

interface SupplierInputProps {
  form: UseFormReturn<Payload, any, undefined>;
}

export const SupplierInput: React.FC<SupplierInputProps> = ({ form }) => {
  const [query, setQuery] = useState("");
  const { data, isSuccess } = useQuery({
    queryKey: ["suppliers", query],
    queryFn: () => getSuppliersAction({ query }),
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
                value={form.getValues("supplierId")}
                onQueryChange={changeQuery}
                onValueChange={onValueChange}
                items={data.data.map((supplier) => ({
                  label: supplier.name,
                  value: supplier.id,
                }))}
              />
            ) : (
              <Skeleton className="h-9" />
            )}
          </FormControl>
          <FormDescription>The supplier for this purchase.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
