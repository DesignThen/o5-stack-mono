import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

const signInRoute = createFileRoute("/_auth/sign-in/$")({
  staticData: {
    breadcrumb: {
      label: "Sign In",
      visible: true,
      linkOptions: { to: "/" },
    },
  },
  validateSearch: (search: Record<string, unknown>) => {
    const raw =
      typeof search.redirect === "string" ? search.redirect : undefined;
    // Only allow relative redirects to prevent open-redirect attacks.
    const redirect =
      raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;
    return { redirect };
  },
  component: SignInPage,
});

export const Route = signInRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Sign In",
      visible: true,
      linkOptions: { to: "/sign-in/$", search: { redirect: undefined } },
    }),
  },
});

function SignInPage() {
  const { redirect } = Route.useSearch();

  return <SignIn fallbackRedirectUrl={redirect ?? "/"} />;
}
