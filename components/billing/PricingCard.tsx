"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const { url, error } = await res.json();
    if (error || !url) { setLoading(false); return; }
    router.push(url);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Pro Plan</CardTitle>
        <CardDescription>Everything you need to ship faster</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">$29<span className="text-base font-normal text-muted-foreground">/mo</span></div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Unlimited projects</li>
          <li>✓ Priority support</li>
          <li>✓ All future features</li>
        </ul>
        <Button onClick={startCheckout} disabled={loading} className="w-full">
          {loading ? "Redirecting…" : "Upgrade to Pro"}
        </Button>
      </CardContent>
    </Card>
  );
}
