import React from "react";
import { MobileSideBar, SideBar } from "./sidebar";
import { db } from "@/server/db";
import { rscAuth } from "@/server/lib/action";
import { and, eq, sql } from "drizzle-orm";
import { notifications } from "@/server/db/schema";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
  const user = await rscAuth();

  const notificationsCount = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, false)),
    )
    .then((recs) => parseInt(recs[0].count));

  return (
    <main className="flex flex-col lg:flex-row items-stretch min-h-[100dvh]">
      <div className="w-60 shrink-0 hidden lg:block" />
      <MobileSideBar notificationsCount={notificationsCount} />
      <SideBar notificationsCount={notificationsCount} />
      <section className="flex-1 bg-secondary border p-4 lg:mt-4 lg:rounded-tl-md flex flex-col gap-4">
        {children}
      </section>
    </main>
  );
};

export default Layout;
