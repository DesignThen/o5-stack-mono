import * as Boundary from "@/components/global/app-boundary";
import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import * as authState from "@/lib/server/auth-state";
import { createFileRoute, Outlet } from "@tanstack/react-router";

const coreRoute = createFileRoute("/_core")({
  staticData: {
    breadcrumb: {
      label: "Dashboard",
      visible: true,
      linkOptions: { to: "/" },
    },
  },
  component: Outlet,
  beforeLoad: async ({ matches, routeId }) => {
    // When this pathless layout is the terminal fuzzy match for an unknown URL,
    // let its notFoundComponent render instead of redirecting from the auth guard.
    if (matches.at(-1)?.routeId === routeId) return;

    await authState.isUser({ data: { redirectTo: "/" } });
  },
  notFoundComponent: (props) => <Boundary.DefaultNotFound {...props} />,
});

export const Route = coreRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Dashboard",
      visible: true,
      linkOptions: { to: "/" },
    }),
  },
});
