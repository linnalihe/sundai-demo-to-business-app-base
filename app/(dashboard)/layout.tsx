import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PostHogIdentify from "@/components/providers/PostHogIdentify";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <div className="flex min-h-screen">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        plan={subscription?.plan_name ?? "free"}
      />
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col">
        <Topbar title="Dashboard" profile={profile} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
