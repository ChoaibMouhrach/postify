"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { Toggle } from "@/client/components/ui/toggle";
import debounce from "debounce";
import { useUpdateSearchParams } from "../hooks/search-params";
import { Skeleton } from "./ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/client/components/ui/sheet";

interface DataTableProps<TData> {
  children?: React.ReactNode;

  // data
  columns: ColumnDef<TData>[];
  data: TData[];

  // meta
  trash: boolean;
  query: string;

  // pagination
  lastPage: number;
  page: number;
}

export function DataTable<TData>({
  children,

  // data
  columns,
  data,

  // meta
  trash,
  query,

  // pagination
  lastPage,
  page,
}: DataTableProps<TData>) {
  const { update } = useUpdateSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const onNext = () => {
    update({
      key: "page",
      value: String(page + 1),
    });
  };

  const onPrevious = () => {
    update({
      key: "page",
      value: String(page - 1),
    });
  };

  const onTrash = (pressed: boolean) => {
    update({
      key: "trash",
      value: pressed ? "true" : "",
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onQuery = React.useCallback(
    debounce((value: string) => {
      update([
        {
          key: "query",
          value,
        },
        {
          key: "page",
          value: "1",
        },
      ]);
    }, 500),
    [update],
  );

  return (
    <div className="w-full">
      <div className="flex justify-between gap-2 items-center pb-4">
        <Input
          onChange={(e) => onQuery(e.target.value)}
          defaultValue={query}
          placeholder="Search..."
          className="max-w-sm"
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-4 p-4">
            <SheetHeader>
              <SheetTitle>Filter</SheetTitle>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-2">
              <Toggle
                variant="outline"
                onPressedChange={onTrash}
                pressed={trash}
              >
                Trash
              </Toggle>
            </div>
          </SheetContent>

          {children}
        </Sheet>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className=" whitespace-nowrap" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {page} of {lastPage || 1}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={page + 1 > lastPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DataTableSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <Skeleton className="h-9 w-full max-w-md" />

        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {[...Array(8)].map((_, index) => (
          <Skeleton className="h-9" key={index} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-9 w-[100px] ml-auto" />
        <Skeleton className="h-9 w-[100px]" />
      </div>
    </div>
  );
};
