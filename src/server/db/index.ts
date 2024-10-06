import { env } from "@/common/env.mjs";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const client = new Client({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(client, {
  schema,
});
