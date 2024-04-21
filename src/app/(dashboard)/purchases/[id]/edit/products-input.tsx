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
import { Payload } from "./edit";

interface ProductsInputProps {
  form: UseFormReturn<Payload, any, undefined>;
}

export const ProductsInput: React.FC<ProductsInputProps> = ({ form }) => {
  const [query, setQuery] = useState("");
  const { data, isSuccess } = useQuery({
    queryKey: ["products", query],
    queryFn: () => getProductsAction({ query }),
    placeholderData: (ph) => ph,
  });

  const addProduct = (id: string) => {
    if (!isSuccess) return;

    for (let product of data.data) {
      if (product.id === id) {
        const p = form.getValues("products").find((p) => p.id === id);

        if (p) {
          form.setValue(
            "products",
            form.getValues("products").map((product) => {
              if (product.id === id) {
                return {
                  ...product,
                  quantity: product.quantity + 1,
                };
              }

              return product;
            }),
          );

          break;
        }

        form.setValue("products", [
          ...form.getValues("products"),
          {
            id,
            name: product.name,
            quantity: 1,
          },
        ]);

        break;
      }
    }

    setQuery("");
  };

  const removeProduct = (id: string) => {
    form.setValue(
      "products",
      form.getValues("products").filter((product) => product.id !== id),
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    form.setValue(
      "products",
      form.getValues("products").map((product) => {
        if (product.id == id) {
          return {
            ...product,
            quantity,
          };
        }

        return product;
      }),
    );
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
              {isSuccess ? (
                <Combobox
                  reset
                  onQueryChange={changeQuery}
                  onValueChange={addProduct}
                  items={data.data.map((product) => ({
                    label: product.name,
                    value: product.id,
                  }))}
                />
              ) : (
                <Skeleton className="h-9" />
              )}
            </FormControl>
            <FormDescription>The products for this purchase.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {form.watch("products").length ? (
            <TableBody>
              {form.watch("products").map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Input
                      value={String(product.quantity)}
                      type="number"
                      step="1"
                      onChange={(e) =>
                        updateQuantity(
                          product.id,
                          parseInt(e.target.value) || 1,
                        )
                      }
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