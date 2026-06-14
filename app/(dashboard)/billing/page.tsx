import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PricingCard from "@/components/billing/PricingCard";
import ManageSubscriptionButton from "@/components/billing/ManageSubscriptionButton";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const isActive = subscription?.status === "active";

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Billing</h2>

      {isActive ? (
        <div className="space-y-4 p-6 border rounded-lg">
          <div>
            <p className="font-medium">Pro Plan</p>
            <p className="text-sm text-muted-foreground">
              Status: <span className="text-green-600 font-medium">{subscription.status}</span>
            </p>
            {subscription.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Renews on{" "}
                {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <ManageSubscriptionButton />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground">You&apos;re on the free plan. Upgrade to unlock all features.</p>
          <PricingCard />
        </div>
      )}
    </div>
  );
}
