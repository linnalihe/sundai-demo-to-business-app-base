"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ManageSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const { url, error } = await res.json();
    if (error || !url) { setLoading(false); return; }
    router.push(url);
  }

  return (
    <Button onClick={openPortal} disabled={loading} variant="outline">
      {loading ? "Opening portal…" : "Manage Subscription"}
    </Button>
  );
}
