import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useUpdateSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (input: Record<string, string> | Record<string, string>[]) => {
    const urlSearchParams = new URLSearchParams(
      Array.from(searchParams.entries()),
    );

    if (input instanceof Array) {
      for (let { key, value } of input) {
        if (!input) {
          urlSearchParams.delete(key);
        } else {
          urlSearchParams.set(key, value);
        }
      }
    } else {
      if (!input.value) {
        urlSearchParams.delete(input.key);
      } else {
        urlSearchParams.set(input.key, input.value);
      }
    }

    router.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return {
    update,
  };
};
