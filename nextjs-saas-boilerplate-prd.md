# Product Requirements Document
## Next.js SaaS Boilerplate

**Version:** 1.0  
**Target Environment:** Vercel  
**Purpose:** A production-ready foundational Next.js application with all core SaaS integrations pre-wired, serving as a reusable starting point for new products.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Variables](#3-environment-variables)
4. [Folder Structure](#4-folder-structure)
5. [Phase 1 — Project Scaffolding](#5-phase-1--project-scaffolding)
6. [Phase 2 — Supabase Integration](#6-phase-2--supabase-integration)
7. [Phase 3 — Resend Email Integration](#7-phase-3--resend-email-integration)
8. [Phase 4 — Stripe Payments Integration](#8-phase-4--stripe-payments-integration)
9. [Phase 5 — PostHog Analytics Integration](#9-phase-5--posthog-analytics-integration)
10. [Phase 6 — UI Components & Polish](#10-phase-6--ui-components--polish)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Local Development Guide](#12-local-development-guide)

---

## 1. Project Overview

Build a Next.js 14 App Router application that functions as a complete SaaS boilerplate. The goal is zero wasted setup time on future projects — every integration should be working end-to-end, including auth flows, payments, transactional email, and analytics.

**This is a developer-facing artifact, not a user-facing product.** The UI should be clean and functional but not styled beyond what shadcn/ui provides out of the box. The value is in the wiring, not the design.

### Core User Flows to Support

1. **Sign Up** → email confirmation → onboarded to dashboard
2. **Log In / Log Out** → session persisted via cookies
3. **Password Reset** → email link → reset form
4. **Subscribe** → Stripe Checkout → success page → subscription stored in DB
5. **Manage Subscription** → Stripe Customer Portal
6. **Protected Routes** → redirect to login if unauthenticated
7. **User Profile** → view/edit display name and avatar

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | latest |
| Auth + DB + Storage | Supabase | latest |
| Payments | Stripe | latest |
| Transactional Email | Resend + React Email | latest |
| Analytics | PostHog | latest |
| Hosting | Vercel | — |
| Package Manager | npm | — |

---

## 3. Environment Variables

Create `.env.local` at the project root. All variables must also be added to Vercel's environment settings before deploying.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO_MONTHLY=   # your Stripe Price ID

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@yourdomain.com

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use `@t3-oss/env-nextjs` to validate all env vars at build time. Create `src/env.ts` that imports and validates every variable above — the build should fail fast if any are missing.

---

## 4. Folder Structure

Build the project with the following structure. Do not deviate from this layout.

```
├── app/
│   ├── (auth)/                        # Public auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx                 # Centered card layout
│   ├── (dashboard)/                   # Protected routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── billing/
│   │   │   └── page.tsx
│   │   └── layout.tsx                 # Sidebar + topbar layout
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts               # Supabase OAuth/email callback
│   │   └── confirm/
│   │       └── route.ts               # Password reset / email change
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── create-checkout-session/
│   │   │   │   └── route.ts
│   │   │   ├── create-portal-session/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── user/
│   │       └── update-profile/
│   │           └── route.ts
│   ├── layout.tsx                     # Root layout with providers
│   ├── page.tsx                       # Landing / marketing page
│   ├── success/
│   │   └── page.tsx                   # Post-Stripe-checkout success
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                            # shadcn/ui auto-generated components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ResetPasswordForm.tsx
│   ├── billing/
│   │   ├── PricingCard.tsx
│   │   └── ManageSubscriptionButton.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   └── providers/
│       ├── PostHogProvider.tsx
│       └── SupabaseProvider.tsx
├── emails/
│   ├── WelcomeEmail.tsx
│   ├── ConfirmEmail.tsx
│   └── PasswordResetEmail.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser client (singleton)
│   │   └── server.ts                  # Server client (cookie-based)
│   ├── stripe.ts                      # Stripe server instance
│   ├── resend.ts                      # Resend client + send helpers
│   └── posthog.ts                     # PostHog server-side client
├── types/
│   ├── supabase.ts                    # Auto-generated DB types
│   └── index.ts                       # Shared app types
├── utils/
│   └── helpers.ts                     # Shared utility functions
├── middleware.ts                       # Session refresh + route protection
├── env.ts                             # Validated env vars (t3-oss)
└── supabase/
    └── migrations/
        └── 0001_initial.sql           # Initial DB schema
```

---

## 5. Phase 1 — Project Scaffolding

### 5.1 Initialize the Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

### 5.2 Install All Dependencies Up Front

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr

# Stripe
npm install stripe @stripe/stripe-js

# Email
npm install resend @react-email/components react-email

# Analytics
npm install posthog-js posthog-node

# Env validation
npm install @t3-oss/env-nextjs zod

# UI
npx shadcn@latest init
npx shadcn@latest add button card input label toast sonner avatar dropdown-menu separator

# Types
npm install -D @types/node
```

### 5.3 Configure `next.config.ts`

- Enable `images.remotePatterns` for Supabase Storage CDN URLs
- Set `experimental.serverActions` to `true` if using Server Actions

### 5.4 Validate Env at Build Time

Create `env.ts` using `@t3-oss/env-nextjs`. Import and validate all variables from section 3. Export a typed `env` object used everywhere in the codebase — never `process.env` directly.

---

## 6. Phase 2 — Supabase Integration

### 6.1 Create Two Supabase Clients

**`lib/supabase/client.ts`** — Browser singleton using `createBrowserClient` from `@supabase/ssr`. Used in Client Components.

**`lib/supabase/server.ts`** — Server client using `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`. Used in Server Components, Route Handlers, and Server Actions.

### 6.2 Middleware

Create `middleware.ts` at the root with the following behavior:

- Instantiate the Supabase server client
- Call `supabase.auth.getUser()` to refresh the session on every request
- **Protected routes** (anything under `/dashboard`, `/settings`, `/billing`): redirect unauthenticated users to `/login`
- **Auth routes** (anything under `/login`, `/signup`): redirect authenticated users to `/dashboard`
- Export a `config.matcher` that excludes `_next/static`, `_next/image`, `favicon.ico`, and all public asset paths

### 6.3 Auth Callback Routes

**`app/auth/callback/route.ts`**
- Accepts `code` and optional `next` query params
- Calls `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `next` or `/dashboard` on success
- Redirects to `/login?error=...` on failure

**`app/auth/confirm/route.ts`**
- Handles `token_hash` and `type` query params
- Calls `supabase.auth.verifyOtp()` for email confirmation and password reset
- Redirects appropriately per `type`

### 6.4 Auth UI Pages

All auth forms use `react-hook-form` + `zod` for validation and display errors inline using shadcn's `FormMessage`.

**`app/(auth)/login/page.tsx`**
- Email + password fields
- "Forgot password?" link → `/reset-password`
- On submit: `supabase.auth.signInWithPassword()`
- On success: redirect to `/dashboard`
- Link to `/signup`

**`app/(auth)/signup/page.tsx`**
- Email + password + confirm password fields
- On submit: `supabase.auth.signUp()` with `emailRedirectTo` pointing to `/auth/callback`
- Show "Check your email" message after submit (do not auto-redirect)
- Link to `/login`

**`app/(auth)/reset-password/page.tsx`**
- Two states: (1) enter email → sends reset email; (2) enter new password (when `token_hash` is present in URL)
- State 1: `supabase.auth.resetPasswordForEmail()` with `redirectTo` pointing to `/auth/confirm`
- State 2: `supabase.auth.updateUser({ password })`

### 6.5 Database Schema

Create `supabase/migrations/0001_initial.sql` with the following:

```sql
-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_name text default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.subscriptions (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
```

### 6.6 Storage

In the Supabase dashboard, create a storage bucket named `avatars` with the following settings:
- **Public:** false
- **File size limit:** 2MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`

Add RLS policies on the `avatars` bucket:
- Users can upload to `{userId}/*`
- Users can read their own files

Create a `uploadAvatar(file: File, userId: string)` utility in `utils/helpers.ts` that uploads to `avatars/{userId}/{filename}` and returns the public URL.

### 6.7 Type Generation

After running migrations, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

This command should be documented in `package.json` as `"db:types": "supabase gen types typescript ..."`.

---

## 7. Phase 3 — Resend Email Integration

### 7.1 Supabase SMTP Configuration

In the Supabase dashboard under **Auth → SMTP Settings**, configure Resend as the SMTP provider:
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: your `RESEND_API_KEY`
- Sender email: value of `RESEND_FROM_EMAIL`

This routes all Supabase auth emails (confirmation, password reset) through Resend.

### 7.2 Resend Client

Create `lib/resend.ts`:
- Export a `resend` instance using `new Resend(env.RESEND_API_KEY)`
- Export a `sendEmail(to, subject, ReactComponent)` helper that wraps `resend.emails.send()` and handles errors

### 7.3 React Email Templates

Create the following templates in `emails/`. Each is a React component that accepts typed props and returns JSX using `@react-email/components`.

**`emails/WelcomeEmail.tsx`** — Sent after a user confirms their email. Props: `{ firstName: string }`.

**`emails/ConfirmEmail.tsx`** — Supabase will use this via SMTP. Should contain the confirmation link placeholder. Props: `{ confirmationUrl: string }`.

**`emails/PasswordResetEmail.tsx`** — Sent when a user requests a password reset. Props: `{ resetUrl: string }`.

Add a script to `package.json`:
```json
"email:dev": "email dev --dir emails --port 3001"
```

### 7.4 Trigger Welcome Email

In `app/auth/callback/route.ts`, after a successful session exchange, check if this is a new user (compare `created_at` to `last_sign_in_at`) and if so, send the `WelcomeEmail` via the `sendEmail` helper.

---

## 8. Phase 4 — Stripe Payments Integration

### 8.1 Stripe Server Instance

Create `lib/stripe.ts`:
- Export a `stripe` instance: `new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })`

### 8.2 Checkout Session Route

**`app/api/stripe/create-checkout-session/route.ts`** (POST)

1. Get the authenticated user from Supabase (return 401 if unauthenticated)
2. Look up the user's `subscriptions` row to get or create a `stripe_customer_id`:
   - If no `stripe_customer_id` exists: call `stripe.customers.create({ email, metadata: { supabase_user_id } })` and save to DB
3. Create a Checkout Session:
   ```ts
   stripe.checkout.sessions.create({
     customer: stripeCustomerId,
     mode: 'subscription',
     line_items: [{ price: env.STRIPE_PRICE_ID_PRO_MONTHLY, quantity: 1 }],
     success_url: `${env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
     subscription_data: { metadata: { supabase_user_id: userId } }
   })
   ```
4. Return `{ url: session.url }` as JSON

### 8.3 Customer Portal Route

**`app/api/stripe/create-portal-session/route.ts`** (POST)

1. Get the authenticated user
2. Fetch `stripe_customer_id` from the `subscriptions` table
3. Create a billing portal session: `stripe.billingPortal.sessions.create({ customer, return_url })`
4. Return `{ url }` and redirect the client

### 8.4 Webhook Handler

**`app/api/stripe/webhook/route.ts`** (POST)

> **Critical:** This route must be excluded from Next.js body parsing. Export `export const config = { api: { bodyParser: false } }` or use `req.text()` directly.

1. Read raw body and `stripe-signature` header
2. Verify with `stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)`
3. Return 400 on verification failure
4. Handle the following events using a `switch` statement:

| Event | Action |
|---|---|
| `checkout.session.completed` | Retrieve subscription, update `subscriptions` row with `stripe_subscription_id`, `stripe_price_id`, `status: 'active'`, `current_period_end` |
| `customer.subscription.updated` | Sync `status`, `stripe_price_id`, `current_period_end` |
| `customer.subscription.deleted` | Set `status: 'canceled'`, clear subscription fields |
| `invoice.payment_failed` | Set `status: 'past_due'` |

5. Use `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) for all DB writes in this route — it bypasses RLS
6. Return `{ received: true }` with status 200 for all handled events

### 8.5 Success Page

**`app/success/page.tsx`**
- Reads `session_id` from query params
- Displays a success message and a button linking to `/dashboard`
- Optionally retrieves the session client-side to show plan details

### 8.6 Billing Page

**`app/(dashboard)/billing/page.tsx`**
- Server Component that fetches the user's subscription from Supabase
- If `status === 'active'`: show current plan, `current_period_end`, and a "Manage Subscription" button that calls the portal route
- If not active: show pricing card with "Upgrade" button that calls the checkout route

---

## 9. Phase 5 — PostHog Analytics Integration

### 9.1 Client-Side Provider

Create `components/providers/PostHogProvider.tsx`:
- A Client Component that initializes PostHog using `posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, { api_host: env.NEXT_PUBLIC_POSTHOG_HOST, capture_pageview: false })`
- Wraps children with `PHProvider` from `posthog-js/react`
- Disables automatic page view capture (we handle it manually below)

### 9.2 Page View Tracking

Create `components/PostHogPageView.tsx`:
- A Client Component that uses `usePathname()` and `useSearchParams()` from Next.js
- On route change, calls `posthog.capture('$pageview')` with the current URL
- This component is placed inside the `PostHogProvider` in the root layout

### 9.3 Server-Side Client

Create `lib/posthog.ts`:
- Export a `posthogServer` instance using `new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, { host: env.NEXT_PUBLIC_POSTHOG_HOST })`
- Used for tracking events inside Route Handlers and Server Actions

### 9.4 User Identification

In `app/(dashboard)/layout.tsx` (Server Component):
- Fetch the authenticated user from Supabase
- Pass the user's `id` and `email` to a Client Component that calls `posthog.identify(userId, { email, plan })`
- This must happen after login, not before

### 9.5 Key Events to Track

Instrument the following events at minimum:

| Event Name | Where | Properties |
|---|---|---|
| `user_signed_up` | `auth/callback/route.ts` | `{ method: 'email' }` |
| `user_logged_in` | `auth/callback/route.ts` | `{ method: 'email' }` |
| `checkout_started` | `create-checkout-session` route | `{ price_id }` |
| `subscription_created` | Stripe webhook | `{ plan, stripe_subscription_id }` |
| `subscription_canceled` | Stripe webhook | `{ plan }` |
| `portal_opened` | `create-portal-session` route | `{}` |

---

## 10. Phase 6 — UI Components & Polish

### 10.1 Root Layout

**`app/layout.tsx`**
- Wrap everything in `PostHogProvider`
- Include `PostHogPageView` inside the provider
- Include `Toaster` (Sonner) for toast notifications
- Set metadata: `title`, `description`

### 10.2 Auth Layout

**`app/(auth)/layout.tsx`**
- Full-height centered layout
- Card container with app logo/name at top
- No navigation

### 10.3 Dashboard Layout

**`app/(dashboard)/layout.tsx`** (Server Component)
- Fetch the current user and subscription server-side
- Render `Sidebar` and `Topbar` as Client Components
- Pass user data as props (avoid redundant fetches)

**`components/dashboard/Sidebar.tsx`**
- Navigation links: Dashboard, Settings, Billing
- Active link highlighting using `usePathname()`
- User avatar + name at the bottom
- Sign out button: calls `supabase.auth.signOut()` then redirects to `/login`

**`components/dashboard/Topbar.tsx`**
- Page title (dynamic)
- User dropdown: Profile, Settings, Sign Out

### 10.4 Dashboard Home

**`app/(dashboard)/dashboard/page.tsx`**
- Server Component
- Fetch the user's profile and subscription
- Display a welcome message, subscription status badge, and quick action cards

### 10.5 Settings Page

**`app/(dashboard)/settings/page.tsx`**
- Form to update `display_name`
- Avatar upload using the Supabase Storage utility
- Calls `/api/user/update-profile` on submit
- Show success/error toast via Sonner

### 10.6 Landing Page

**`app/page.tsx`**
- Simple marketing page
- Hero section with product name and tagline
- Pricing section with a single plan card
- CTA buttons: "Get started" → `/signup`, "Sign in" → `/login`
- No complex design required — functional and clean is sufficient

### 10.7 Error Handling

- `app/error.tsx` — Catches runtime errors in the dashboard, shows a friendly message and a reload button
- `app/not-found.tsx` — Custom 404 with a link back to `/dashboard`
- All API routes return consistent error shapes: `{ error: string, code?: string }`

### 10.8 Loading States

Add `loading.tsx` to the following route segments:
- `app/(dashboard)/dashboard/`
- `app/(dashboard)/billing/`
- `app/(dashboard)/settings/`

Each should render a skeleton version of the page using shadcn's `Skeleton` component.

---

## 11. Acceptance Criteria

The boilerplate is complete when all of the following pass:

### Auth
- [ ] A new user can sign up with email + password
- [ ] The confirmation email is delivered via Resend and the link works
- [ ] Confirming email redirects to `/dashboard`
- [ ] A returning user can log in and is redirected to `/dashboard`
- [ ] A logged-in user accessing `/login` is redirected to `/dashboard`
- [ ] An unauthenticated user accessing `/dashboard` is redirected to `/login`
- [ ] Password reset email is delivered and the reset flow works end-to-end
- [ ] Signing out clears the session and redirects to `/login`

### Database
- [ ] A `profiles` row is auto-created when a user signs up
- [ ] A `subscriptions` row is auto-created when a user signs up
- [ ] Users cannot read other users' data (RLS is enforced)
- [ ] Profile updates via the settings page are persisted

### Stripe
- [ ] Clicking "Upgrade" creates a Checkout Session and redirects to Stripe
- [ ] Completing checkout redirects to `/success`
- [ ] The `subscriptions` table is updated within seconds of checkout completion (via webhook)
- [ ] The billing page reflects the active subscription status after purchase
- [ ] Clicking "Manage Subscription" opens the Stripe Customer Portal
- [ ] Canceling via the portal updates the subscription status in the DB (via webhook)

### Email
- [ ] Welcome email is sent after a user confirms their email
- [ ] All emails render correctly in the React Email preview (`npm run email:dev`)

### Analytics
- [ ] Page views are tracked on every route change
- [ ] `user_signed_up` event appears in PostHog after signup
- [ ] `subscription_created` event appears in PostHog after checkout

### General
- [ ] Build succeeds with no TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint errors
- [ ] All env vars are validated at startup — missing vars crash the build with a clear error
- [ ] App is deployed and functional on Vercel with production env vars set

---

## 12. Local Development Guide

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Stripe CLI
- Supabase CLI (`npm install -g supabase`)

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase (requires Docker)
supabase start

# 3. Apply migrations
supabase db push

# 4. Generate TypeScript types
npm run db:types

# 5. Copy env template and fill in values
cp .env.local.example .env.local

# 6. Start the app
npm run dev

# 7. In a separate terminal, forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 8. In a separate terminal (optional), preview emails
npm run email:dev
```

### package.json Scripts to Include

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:types": "supabase gen types typescript --local > types/supabase.ts",
    "email:dev": "email dev --dir emails --port 3001",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe/webhook"
  }
}
```

### Key Local URLs

| Service | URL |
|---|---|
| Next.js app | http://localhost:3000 |
| Supabase Studio | http://localhost:54323 |
| React Email preview | http://localhost:3001 |
| Stripe webhook listener | Runs in terminal |

---

*End of PRD — Build phases should be executed in order: 1 → 2 → 3 → 4 → 5 → 6*
