import * as Boundary from "@/components/global/app-boundary";
import { COMPANY } from "@/lib/constants";
import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import * as authState from "@/lib/server/auth-state";
import { createFileRoute, Outlet } from "@tanstack/react-router";

const authRoute = createFileRoute("/_auth")({
  staticData: {
    breadcrumb: {
      label: "Auth",
      visible: false,
      linkOptions: { to: "/" },
    },
  },
  component: AuthLayout,
  beforeLoad: async ({ matches, routeId }) => {
    // When this pathless layout is the terminal fuzzy match for an unknown URL,
    // let its notFoundComponent render instead of redirecting from the guest guard.
    if (matches.at(-1)?.routeId === routeId) return;

    await authState.isGuest();
  },
  notFoundComponent: (props) => <Boundary.DefaultNotFound {...props} />,
});

export const Route = authRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Auth",
      visible: false,
      linkOptions: { to: "/sign-in/$", search: { redirect: undefined } },
    }),
  },
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <COMPANY.icon className="size-4" />
          </div>
          <span>{COMPANY.siteName}</span>
        </a>
        <Outlet />
      </div>
    </div>
  );
}
