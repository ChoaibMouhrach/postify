import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // NEXTAUTH
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(16),

    // RESEND
    RESEND_TOKEN: z.string().startsWith("re"),
    RESEND_DOMAIN: z.string().min(3),

    // DATABASE
    DATABASE_URL: z.string().url(),
  },
  client: {},
  runtimeEnv: {
    // NEXTAUTH
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

    // RESEND
    RESEND_TOKEN: process.env.RESEND_TOKEN,
    RESEND_DOMAIN: process.env.RESEND_DOMAIN,

    // DATABASE
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
