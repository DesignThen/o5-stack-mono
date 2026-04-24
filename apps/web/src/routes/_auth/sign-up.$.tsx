import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

const signUpRoute = createFileRoute("/_auth/sign-up/$")({
  staticData: {
    breadcrumb: {
      label: "Sign Up",
      visible: true,
      linkOptions: { to: "/sign-up/$" },
    },
  },
  component: SignUpPage,
});

export const Route = signUpRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Sign Up",
      visible: true,
      linkOptions: { to: "/sign-up/$" },
    }),
  },
});

function SignUpPage() {
  return <SignUp fallbackRedirectUrl="/" />;
}
