# Next.js SaaS Boilerplate

A production-ready Next.js 16 starter with auth, payments, transactional email, and analytics pre-wired. Clone it, fill in credentials, and start building your product.

## What's included

| Feature | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth + Database + Storage | Supabase |
| Payments | Stripe |
| Transactional Email | Resend + React Email |
| Analytics | PostHog |
| Env validation | @t3-oss/env-nextjs |

## Core user flows

- Sign up → email confirmation → dashboard
- Log in / log out (cookie-based session)
- Password reset via email link
- Subscribe → Stripe Checkout → subscription stored in DB
- Manage subscription via Stripe Customer Portal
- Protected routes (unauthenticated users redirected to login)
- Profile settings with avatar upload

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 20.9+** — check with `node --version`
- **npm** — comes with Node
- Accounts on: **Supabase**, **Stripe**, **Resend**, **PostHog** (all have free tiers)

---

## Step 1 — Clone and install

```bash
git clone https://github.com/linnalihe/sundai-demo-to-business-app-base.git
cd sundai-demo-to-business-app-base
npm install
```

---

## Step 2 — Create your .env.local

Copy the example file and open it in your editor:

```bash
cp .env.local.example .env.local
```

You'll fill in each value in the steps below. The file looks like this:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_... (replaces ANON_KEY)
SUPABASE_SECRET_KEY=                    # sb_secret_... (replaces SERVICE_ROLE_KEY, server-only)

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO_MONTHLY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@yourdomain.com

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3 — Set up Supabase

### 3.1 Create a project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for it to finish provisioning (about 1 minute).

### 3.2 Get your API keys

In your Supabase project, go to **Settings → API Keys**.

Supabase now has two key formats. Use the **new format** if your project shows them (keys starting with `sb_`), otherwise use the legacy format — both work:

| What you need | New format (preferred) | Legacy format |
|---|---|---|
| Public/client key | **Publishable key** (`sb_publishable_...`) | **anon** key (JWT) |
| Server-only key | **Secret key** (`sb_secret_...`) | **service_role** key (JWT) |

- Copy your **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
- Copy your **publishable key** (or legacy **anon** key) → paste as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Copy your **secret key** (or legacy **service_role** key) → paste as `SUPABASE_SECRET_KEY`

> `SUPABASE_SECRET_KEY` bypasses Row Level Security. Never expose it to the browser or commit it to source control.

> **Note:** The legacy `anon` and `service_role` JWT keys still work but will be deprecated by end of 2026. New projects should use the `sb_publishable_` / `sb_secret_` format.

### 3.3 Run the database migration

1. In your Supabase project, go to **SQL Editor**.
2. Open `supabase/migrations/0001_initial.sql` from this repo.
3. Paste the entire contents into the SQL editor and click **Run**.

This creates:
- `profiles` table (auto-populated on signup)
- `subscriptions` table (auto-populated on signup)
- A trigger that creates both rows whenever a new user signs up
- Row Level Security policies so users can only see their own data

### 3.4 Create the avatars storage bucket

1. Go to **Storage** in your Supabase project.
2. Click **New bucket**, name it `avatars`, and leave **Public bucket** unchecked.
3. Click **Create bucket**.
4. Go to **Policies** on the `avatars` bucket and add two policies:

**Policy 1 — Upload (INSERT):**
- Policy name: `Users can upload their own avatar`
- Allowed operation: INSERT
- Target roles: authenticated
- USING expression: `(storage.foldername(name))[1] = auth.uid()::text`

**Policy 2 — Read (SELECT):**
- Policy name: `Users can read their own avatar`
- Allowed operation: SELECT
- Target roles: authenticated
- USING expression: `(storage.foldername(name))[1] = auth.uid()::text`

### 3.5 Configure Auth redirect URLs

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:3000` (change to your production URL when deploying).
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`

### 3.6 Configure SMTP to use Resend

> Do this after completing Step 5 (Resend setup) so you have your API key ready.

1. Go to **Authentication → SMTP Settings**.
2. Enable **Custom SMTP**.
3. Fill in:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** your `RESEND_API_KEY`
   - **Sender email:** the same value as `RESEND_FROM_EMAIL`
   - **Sender name:** your app name

This routes all Supabase auth emails (confirmation, password reset) through Resend.

---

## Step 4 — Set up Stripe

### 4.1 Get your API keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and make sure you're in **Test mode** (toggle in the top-left).
2. Go to **Developers → API keys**:
   - Copy **Secret key** → paste as `STRIPE_SECRET_KEY`
   - Copy **Publishable key** → paste as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4.2 Create a product and price

1. Go to **Product catalog → Add product**.
2. Give it a name (e.g. "Pro Plan").
3. Add a price: select **Recurring**, set the amount (e.g. $29), interval **Monthly**.
4. Click **Save product**.
5. On the product page, click the price you just created. Copy the **Price ID** (starts with `price_`) → paste as `STRIPE_PRICE_ID_PRO_MONTHLY`.

### 4.3 Configure the webhook secret (for local testing)

You'll use the Stripe CLI to forward webhook events to your local server.

1. Install the Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Log in: `stripe login`
3. In a separate terminal, start listening:
   ```bash
   npm run stripe:listen
   ```
   This outputs a **webhook signing secret** that starts with `whsec_`. Copy it → paste as `STRIPE_WEBHOOK_SECRET`.

> For production, create a webhook endpoint in the Stripe dashboard pointing to `https://yourdomain.com/api/stripe/webhook` with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Use the secret from that webhook instead.

---

## Step 5 — Set up Resend

1. Go to [resend.com](https://resend.com) and create an account.
2. Go to **API Keys → Create API Key**. Copy it → paste as `RESEND_API_KEY`.
3. For `RESEND_FROM_EMAIL`: if you have a verified domain, use `hello@yourdomain.com`. If you're just testing without a domain, use `onboarding@resend.dev` (Resend's shared test address — works out of the box without domain setup).

> To send from your own domain, go to **Domains** in Resend and follow the DNS verification steps.

---

## Step 6 — Set up PostHog

1. Go to [posthog.com](https://posthog.com) and create an account and a new project.
2. On the **Getting started** page, copy your **Project API key** (starts with `phc_`) → paste as `NEXT_PUBLIC_POSTHOG_KEY`.
3. `NEXT_PUBLIC_POSTHOG_HOST` defaults to `https://app.posthog.com` — leave it unless you're self-hosting.

---

## Step 7 — Run the app locally

You need up to three terminals:

**Terminal 1 — Next.js dev server:**
```bash
npm run dev
```
App is now running at [http://localhost:3000](http://localhost:3000).

**Terminal 2 — Stripe webhook forwarding:**
```bash
npm run stripe:listen
```
Keep this running whenever you're testing payments. It forwards Stripe events to your local `/api/stripe/webhook` endpoint.

**Terminal 3 — Email preview (optional):**
```bash
npm run email:dev
```
Opens a live preview of all email templates at [http://localhost:3001](http://localhost:3001).

---

## Step 8 — Test the core flows

Work through this checklist to confirm everything is wired up correctly.

### Auth

- [ ] Go to `/signup`, create an account with your email
- [ ] Check your inbox — you should receive a confirmation email via Resend
- [ ] Click the confirmation link — you should land on `/dashboard`
- [ ] Sign out, then go to `/login` and sign back in
- [ ] Go to `/reset-password`, request a reset, check your email, and complete the password reset

### Database

- [ ] In Supabase → **Table editor**, check the `profiles` table — you should see a row for your user
- [ ] Check the `subscriptions` table — you should also see a row with `status = inactive`

### Stripe

- [ ] Go to `/billing` — you should see the pricing card
- [ ] Click **Upgrade to Pro** — you should be redirected to a Stripe Checkout page
- [ ] Complete the checkout using Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] You should be redirected to `/success`
- [ ] Go to `/billing` — it should now show your active subscription
- [ ] In the Stripe CLI terminal, you should see a `checkout.session.completed` event logged
- [ ] In Supabase → `subscriptions` table, the row should now have `status = active`
- [ ] Click **Manage Subscription** — you should be redirected to the Stripe Customer Portal

### Email

- [ ] Run `npm run email:dev` and open [http://localhost:3001](http://localhost:3001) — all three email templates should render correctly

### Analytics

- [ ] In PostHog → **Activity**, you should see `user_signed_up` and `$pageview` events after signing up
- [ ] After completing Stripe checkout, you should see a `subscription_created` event

### Settings

- [ ] Go to `/settings`, update your display name and save — it should persist
- [ ] Upload an avatar image — it should appear in the sidebar and topbar

---

## Deploying to Vercel

1. Push your code to GitHub (already done).
2. Go to [vercel.com](https://vercel.com), import your repository.
3. In the project settings, go to **Environment Variables** and add all 9 variables from your `.env.local`.
4. Update your Supabase Auth redirect URLs to include your production domain:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/confirm`
5. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to `https://yourdomain.com`.
6. Create a new Stripe webhook endpoint in the dashboard for `https://yourdomain.com/api/stripe/webhook`, update `STRIPE_WEBHOOK_SECRET` with the new signing secret.
7. Deploy.

---

## Available scripts

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:types     # Regenerate TypeScript types from Supabase schema
npm run email:dev    # Preview email templates at localhost:3001
npm run stripe:listen  # Forward Stripe webhooks to localhost
```

---

## Project structure

```
app/
  (auth)/           # Public auth pages (login, signup, reset-password)
  (dashboard)/      # Protected pages (dashboard, settings, billing)
  auth/             # Supabase callback route handlers
  api/stripe/       # Stripe checkout, portal, and webhook routes
  api/user/         # Profile update route
components/
  auth/             # Login, signup, reset-password forms
  billing/          # PricingCard, ManageSubscriptionButton
  dashboard/        # Sidebar, Topbar
  providers/        # PostHog provider and user identification
  ui/               # shadcn/ui components
emails/             # React Email templates
lib/
  supabase/         # Browser and server Supabase clients
  stripe.ts         # Stripe server instance
  resend.ts         # Resend client and sendEmail helper
  posthog.ts        # PostHog server-side client
supabase/
  migrations/       # SQL migration files
types/              # Supabase DB types and shared app types
utils/
  helpers.ts        # Avatar upload utility
env.ts              # Validated environment variables (import this, not process.env)
proxy.ts            # Session refresh middleware + route protection
```
