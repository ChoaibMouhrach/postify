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
import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import debounce from "debounce";
import { Payload } from "./create";
import { getCustomersAction } from "@/server/controllers/customer";

interface CustomerInputProps {
  form: UseFormReturn<Payload, any, undefined>;
  businessId: string;
}

export const CustomerInput: React.FC<CustomerInputProps> = ({
  form,
  businessId,
}) => {
  const [query, setQuery] = useState("");
  const { data, error, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["customer", query],
    queryFn: async () => {
      const response = await getCustomersAction({ query, businessId });

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

  const onValueChange = (value: string) => {
    form.setValue("customerId", value);
  };

  const customerId = form.watch("customerId");

  useEffect(() => {
    if (isSuccess && customerId && !form.getValues("shippingAddress")) {
      const customer = data.data.find((customer) => customer.id, customerId)!;

      if (customer.address) {
        form.setValue("shippingAddress", customer.address);
      }
    }
  }, [data, customerId, isSuccess, form]);

  return (
    <FormField
      name="customerId"
      render={() => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          <FormControl>
            {isSuccess && (
              <Combobox
                query={query}
                value={form.getValues("customerId")}
                onQueryChange={changeQuery}
                onValueChange={onValueChange}
                items={data.data.map((customer) => ({
                  label: customer.name,
                  value: customer.id,
                }))}
              />
            )}
            {isError && error.message}
            {isLoading && <Skeleton className="h-10" />}
          </FormControl>
          <FormDescription>The customer for this order.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
