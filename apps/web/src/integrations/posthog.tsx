import { env } from "@/env";
import { PostHogProvider as BasePostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import type { ReactNode } from "react";
import PostHogClerkBridge from "../integrations/posthog-clerk-bridge";

if (typeof window !== "undefined" && env.VITE_POSTHOG_KEY) {
  posthog.init(env.VITE_POSTHOG_KEY, {
    api_host: env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    defaults: "2025-11-30",
  });
}

interface PostHogProviderProps {
  children: ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  return (
    <BasePostHogProvider client={posthog}>
      <PostHogClerkBridge />
      {children}
    </BasePostHogProvider>
  );
}
