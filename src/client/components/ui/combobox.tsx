"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/client/lib/utils";
import { Button } from "@/client/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/client/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";

interface ComboboxProps {
  items: { value: string; label: string }[];
  reset?: boolean;
  // eslint-disable-next-line no-unused-vars
  onValueChange?: (value: string) => unknown;
  // eslint-disable-next-line no-unused-vars
  onQueryChange?: (value: string) => unknown;
  className?: string;
  value?: string;
  query?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  reset,
  items,
  value,
  query,
  className,
  onValueChange,
  onQueryChange,
}) => {
  const [v, setV] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (value !== undefined) setV(value);
  }, [value]);

  const handleSearch = (value: string) => {
    setSearch(value);
    onQueryChange?.(value);
  };

  React.useEffect(() => {
    if (query !== undefined) setSearch(query);
  }, [query]);

  return (
    <div className={cn("", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {v ? items.find((item) => item.value === v)?.label : "Select..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 !PopoverContent">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              placeholder="Search..."
              onValueChange={handleSearch}
            />
            <CommandGroup>
              {items.length ? (
                items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      const value = currentValue === v ? "" : currentValue;
                      if (!reset) setV(value);
                      onValueChange?.(value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        v === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>No results.</CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
