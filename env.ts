import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_SECRET_KEY: z.string().default(""),
    STRIPE_SECRET_KEY: z.string().default(""),
    STRIPE_WEBHOOK_SECRET: z.string().default(""),
    STRIPE_PRICE_ID_PRO_MONTHLY: z.string().default(""),
    RESEND_API_KEY: z.string().default(""),
    RESEND_FROM_EMAIL: z.string().email().default("placeholder@example.com"),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("http://localhost:54321"),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().default(""),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(""),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().default(""),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID_PRO_MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
