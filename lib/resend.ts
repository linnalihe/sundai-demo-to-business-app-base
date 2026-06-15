import { Resend } from "resend";
import { env } from "@/env";
import type { ReactElement } from "react";

let _resend: Resend | null = null;

function getResend() {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export async function sendEmail(
  to: string,
  subject: string,
  component: ReactElement
) {
  const resend = getResend();
  if (!resend) {
    console.warn("[Resend] No API key configured — email not sent");
    return;
  }

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    react: component,
  });

  if (error) {
    console.error("[Resend] Failed to send email:", error);
  }
}
