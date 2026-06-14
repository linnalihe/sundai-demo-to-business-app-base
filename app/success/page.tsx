import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Subscription Active" };

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="text-center space-y-4 p-8 bg-background rounded-xl border shadow-sm max-w-sm w-full">
        <div className="text-4xl">🎉</div>
        <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
        <p className="text-muted-foreground">
          Your subscription is now active. Head to the dashboard to get started.
        </p>
        <Button className="w-full" render={<Link href="/dashboard" />}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
