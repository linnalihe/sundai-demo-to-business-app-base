"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

interface PostHogIdentifyProps {
  userId: string;
  email: string | null | undefined;
  plan: string;
}

export default function PostHogIdentify({ userId, email, plan }: PostHogIdentifyProps) {
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog && userId) {
      posthog.identify(userId, { email, plan });
    }
  }, [posthog, userId, email, plan]);

  return null;
}
