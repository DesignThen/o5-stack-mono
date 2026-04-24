import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import { Waitlist } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

const waitlistRoute = createFileRoute("/_auth/waitlist/$")({
  staticData: {
    breadcrumb: {
      label: "Waitlist",
      visible: true,
      linkOptions: { to: "/waitlist/$" },
    },
  },
  component: WaitlistPage,
});

export const Route = waitlistRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Waitlist",
      visible: true,
      linkOptions: { to: "/waitlist/$" },
    }),
  },
});

function WaitlistPage() {
  return <Waitlist afterJoinWaitlistUrl="/" signInUrl="/sign-in" />;
}
