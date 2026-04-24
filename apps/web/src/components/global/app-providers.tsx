import { env } from "@/env";
import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/ui/themes";
import { Toaster } from "@repo/ui/components/sonner";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { ThemeProvider } from "@repo/ui/hooks/use-theme";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import PostHogProvider from "../../integrations/posthog";

interface Props {
  children: React.ReactNode;
  convexClient: React.ComponentProps<typeof ConvexProviderWithClerk>["client"];
}

export function AppProviders({ children, convexClient }: Props) {
  return (
    <ThemeProvider>
      <ClerkProvider
        appearance={{ theme: shadcn }}
        publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      >
        <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
          <PostHogProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors />
            </TooltipProvider>
          </PostHogProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  );
}
