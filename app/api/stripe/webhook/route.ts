import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { posthogServer } from "@/lib/posthog";
import { env } from "@/env";
import type { Database } from "@/types/supabase";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

function createServiceRoleClient() {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  if (!item?.current_period_end) return null;
  return new Date(item.current_period_end * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (!session.subscription) break;

      const subscription = await getStripe().subscriptions.retrieve(
        typeof session.subscription === "string" ? session.subscription : session.subscription.id
      );
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      const { error } = await supabase.from("subscriptions").update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: "active",
        current_period_end: getPeriodEnd(subscription),
        plan_name: "pro",
      }).eq("user_id", userId);

      if (!error) {
        posthogServer.capture({
          distinctId: userId,
          event: "subscription_created",
          properties: { plan: "pro", stripe_subscription_id: subscription.id },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase.from("subscriptions").update({
        status: subscription.status,
        stripe_price_id: subscription.items.data[0].price.id,
        current_period_end: getPeriodEnd(subscription),
      }).eq("user_id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase.from("subscriptions").update({
        status: "canceled",
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_end: null,
        plan_name: "free",
      }).eq("user_id", userId);

      posthogServer.capture({
        distinctId: userId,
        event: "subscription_canceled",
        properties: { plan: "pro" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id;
      if (!customerId) break;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("user_id", sub.user_id);
      }
      break;
    }
  }

  await posthogServer.shutdown();
  return NextResponse.json({ received: true });
}
