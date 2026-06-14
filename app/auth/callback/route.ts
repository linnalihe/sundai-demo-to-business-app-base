import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { posthogServer } from "@/lib/posthog";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { createElement } from "react";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "auth_error")}`
    );
  }

  const user = data.user;
  const isNewUser =
    user.created_at &&
    user.last_sign_in_at &&
    new Date(user.created_at).getTime() === new Date(user.last_sign_in_at).getTime();

  if (isNewUser) {
    posthogServer.capture({ distinctId: user.id, event: "user_signed_up", properties: { method: "email" } });
    const firstName = user.user_metadata?.display_name?.split(" ")[0] ?? "there";
    await sendEmail(user.email!, "Welcome!", createElement(WelcomeEmail, { firstName }));
  } else {
    posthogServer.capture({ distinctId: user.id, event: "user_logged_in", properties: { method: "email" } });
  }

  await posthogServer.shutdown();

  return NextResponse.redirect(`${origin}${next}`);
}
