"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailData = z.infer<typeof emailSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

interface ResetPasswordFormProps {
  verified?: boolean;
}

export default function ResetPasswordForm({ verified = false }: ResetPasswordFormProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailForm = useForm<EmailData>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  async function onRequestReset(data: EmailData) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm?type=recovery`,
    });

    if (error) { setServerError(error.message); return; }
    setEmailSent(true);
  }

  async function onUpdatePassword(data: PasswordData) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) { setServerError(error.message); return; }
    setPasswordUpdated(true);
  }

  if (passwordUpdated) {
    return (
      <div className="text-center space-y-2">
        <p className="font-medium">Password updated</p>
        <p className="text-sm text-muted-foreground">
          Your password has been updated. You can now{" "}
          <a href="/login" className="underline">sign in</a>.
        </p>
      </div>
    );
  }

  if (verified) {
    return (
      <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" {...passwordForm.register("password")} />
          {passwordForm.formState.errors.password && (
            <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
          {passwordForm.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
          {passwordForm.formState.isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    );
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-2">
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a password reset link to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={emailForm.handleSubmit(onRequestReset)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...emailForm.register("email")} />
        {emailForm.formState.errors.email && (
          <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
        )}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
        {emailForm.formState.isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
