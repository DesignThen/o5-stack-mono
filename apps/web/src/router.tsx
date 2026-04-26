import * as Boundary from "@/components/global/app-boundary";
import { env } from "@/env";
import { ConvexQueryClient } from "@convex-dev/react-query";
import * as Sentry from "@sentry/tanstackstart-react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const convexQueryClient = new ConvexQueryClient(env.VITE_CONVEX_URL);

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,

    context: {
      queryClient,
      convexClient: convexQueryClient.convexClient,
      convexQueryClient,
    },

    defaultErrorComponent: (props) => <Boundary.DefaultError {...props} />,
    defaultNotFoundComponent: (props) => (
      <Boundary.DefaultNotFound {...props} />
    ),

    scrollRestoration: true,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
      sendDefaultPii: true,

      integrations: [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
        Sentry.replayIntegration(),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for tracing.
      // We recommend adjusting this value in production.
      // Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error.
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Enable logs to be sent to Sentry
      enableLogs: true,
    });
  }

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
