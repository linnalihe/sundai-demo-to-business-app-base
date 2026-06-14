import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-bold text-lg">SaaS Starter</span>
        <div className="flex gap-3">
          <Button variant="ghost" render={<Link href="/login" />}>Sign in</Button>
          <Button render={<Link href="/signup" />}>Get started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Ship your SaaS faster
        </h1>
        <p className="text-xl text-muted-foreground">
          A production-ready boilerplate with auth, payments, email, and analytics pre-wired.
          Start building in minutes, not days.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg" render={<Link href="/signup" />}>Get started free</Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>Sign in</Button>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Simple pricing</h2>
        <div className="flex justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For individuals and small teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                $29<span className="text-base font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited projects</li>
                <li>✓ Priority support</li>
                <li>✓ All integrations included</li>
                <li>✓ All future features</li>
              </ul>
              <Button className="w-full" render={<Link href="/signup" />}>Get started</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
