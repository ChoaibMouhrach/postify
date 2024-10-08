"use client";

import { Button } from "@/client/components/ui/button";
import { useRouter } from "next/navigation";

const Forbidden = () => {
  const router = useRouter();

  return (
    <main>
      403 <Button onClick={() => router.back()}>Back</Button>
    </main>
  );
};

export default Forbidden;
