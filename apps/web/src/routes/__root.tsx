import * as Boundary from "@/components/global/app-boundary";
import { AppLayout } from "@/components/global/app-layout";
import { AppProviders } from "@/components/global/app-providers";
import { COMPANY } from "@/lib/constants";
import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import { auth } from "@clerk/tanstack-react-start/server";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { themeScript } from "@repo/ui/hooks/use-theme";
import appCss from "@repo/ui/styles/globals.css?url";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type { ConvexReactClient } from "convex/react";

const fetchAuthContext = createServerFn({ method: "GET" }).handler(async () => {
  const { userId, getToken } = await auth();

  if (!userId) return null;

  let convexToken: string | null = null;
  try {
    convexToken = await getToken();
  } catch (error) {
    console.warn("[auth] Unable to fetch Clerk Convex JWT", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return { convexToken, userId };
});

const rootRoute = createRootRouteWithContext<{
  readonly queryClient: QueryClient;
  readonly convexClient: ConvexReactClient;
  readonly convexQueryClient: ConvexQueryClient;
}>()({
  staticData: {
    breadcrumb: {
      label: COMPANY.siteName,
      visible: false,
      linkOptions: { to: "/" },
    },
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },

      { name: "HandheldFriendly", content: "true" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#1f1323",
        media: "(prefers-color-scheme: dark)",
      },

      { title: COMPANY.siteName },
      { name: "og:site_name", content: COMPANY.siteName },
      { name: "og:type", content: "website" },
      { name: "og:image", content: undefined },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://img.clerk.com",
        crossOrigin: "anonymous",
      },
    ],
  }),

  beforeLoad: async ({ context }) => {
    const authContext = await fetchAuthContext();
    if (!authContext) return;

    // Only fetch token during SSR when serverHttpClient exists
    if (context.convexQueryClient.serverHttpClient) {
      if (authContext.convexToken) {
        context.convexQueryClient.serverHttpClient.setAuth(
          authContext.convexToken,
        );
      }
    }

    return {
      userId: authContext.userId,
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: (props) => <Boundary.DefaultNotFound {...props} />,
});

export const Route = rootRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: COMPANY.siteName,
      visible: false,
      linkOptions: { to: "/" },
    }),
  },
});

function RootComponent(): React.ReactElement {
  const context = useRouteContext({ from: Route.id });

  return (
    <AppProviders convexClient={context.convexClient}>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </AppProviders>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className="group/body overscroll-none antialiased [--footer-height:--spacing(14)] [--header-height:--spacing(14)] xl:[--footer-height:--spacing(24)] theme-default">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
