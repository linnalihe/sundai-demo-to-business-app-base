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

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  posthogServer.capture({ distinctId: user.id, event: "portal_opened", properties: {} });
  await posthogServer.shutdown();

  return NextResponse.json({ url: portalSession.url });
}
