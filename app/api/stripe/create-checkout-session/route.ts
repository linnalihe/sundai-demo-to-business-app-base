import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { posthogServer } from "@/lib/posthog";
import { env } from "@/env";

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let stripeCustomerId = sub?.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    stripeCustomerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("user_id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: env.STRIPE_PRICE_ID_PRO_MONTHLY, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    subscription_data: { metadata: { supabase_user_id: user.id } },
  });

  posthogServer.capture({ distinctId: user.id, event: "checkout_started", properties: { price_id: env.STRIPE_PRICE_ID_PRO_MONTHLY } });
  await posthogServer.shutdown();

  return NextResponse.json({ url: session.url });
}
