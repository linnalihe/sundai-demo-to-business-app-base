import { Resend } from "resend";
import { env } from "@/env";
import type { ReactElement } from "react";

export const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  component: ReactElement
) {
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
