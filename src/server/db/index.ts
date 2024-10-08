import { env } from "@/common/env";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const client = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "production",
});
