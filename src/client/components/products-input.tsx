import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
  FormLabel,
} from "@/client/components/ui/form";
import React, { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { Trash } from "lucide-react";
import { Input } from "@/client/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/server/controllers/product";
import { Combobox } from "@/client/components/ui/combobox";
import { Skeleton } from "@/client/components/ui/skeleton";
import debounce from "debounce";
import { Button } from "@/client/components/ui/button";
import { Payload } from "../../app/(dashboard)/(businesses)/businesses/[businessId]/purchases/create/create";
import { toast } from "sonner";

interface ProductsInputProps {
  form: UseFormReturn<Payload, any, undefined>;
  businessId: string;
}

export const ProductsInput: React.FC<ProductsInputProps> = ({
  form,
  businessId,
}) => {
  const [query, setQuery] = useState("");
  const { data, error, isError, isLoading, isSuccess } = useQuery({
    queryKey: ["products", query],
    queryFn: async () => {
      const response = await getProductsAction({ query, businessId });

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

  const addProduct = (id: string) => {
    if (!isSuccess) return;

    for (let product of data.data) {
      if (product.id !== id) {
        continue;
      }
      const p = form.getValues("products").find((p) => p.id === id);

      if (p) {
        toast.error("Item already selected");
        break;
      }

      form.setValue("products", [
        ...form.getValues("products"),
        {
          id,
          name: product.name,
          quantity: 1,
          cost: 1,
        },
      ]);

      break;
    }
  };

  const removeProduct = (id: string) => {
    form.setValue(
      "products",
      form.getValues("products").filter((product) => product.id !== id),
    );
  };

  const updateProduct = (
    type: "cost" | "quantity",
    id: string,
    value: string,
  ) => {
    let v;

    if (type === "quantity") {
      v = parseInt(value);
    } else {
      v = parseFloat(value);
    }

    if (!v) {
      return;
    }

    form.setValue(
      "products",
      form.getValues("products").map((product) => {
        if (product.id == id) {
          const body = {
            ...product,
          };

          if (type === "quantity") {
            body["quantity"] = v;
          } else {
            body["cost"] = v;
          }

          return body;
        }

        return product;
      }),
    );
  };

  const updateQuantity = (id: string, quantity: string) => {
    updateProduct("quantity", id, quantity);
  };

  const updateCost = (id: string, cost: string) => {
    updateProduct("cost", id, cost);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeQuery = useCallback(
    debounce((query: string) => {
      setQuery(query);
    }, 500),
    [],
  );

  return (
    <>
      <FormField
        name="products"
        render={() => (
          <FormItem>
            <FormLabel>Products</FormLabel>
            <FormControl>
              {isSuccess && (
                <Combobox
                  reset
                  query={query}
                  onQueryChange={changeQuery}
                  onValueChange={addProduct}
                  items={data.data.map((product) => ({
                    label: product.name,
                    value: product.id,
                  }))}
                />
              )}
              {isLoading && <Skeleton className="h-10" />}
              {isError && error.message}
            </FormControl>
            <FormDescription>The products for this purchase.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="whitespace-nowrap">
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {form.watch("products").length ? (
            <TableBody>
              {form.watch("products").map((product) => (
                <TableRow key={product.id} className="whitespace-nowrap">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Input
                      step="1"
                      type="number"
                      defaultValue={String(product.quantity)}
                      onChange={(e) =>
                        updateQuantity(product.id, e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      step="0.001"
                      type="number"
                      defaultValue={String(product.cost)}
                      onChange={(e) => updateCost(product.id, e.target.value)}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableCaption>No results</TableCaption>
          )}
        </Table>
      </div>
    </>
  );
};
