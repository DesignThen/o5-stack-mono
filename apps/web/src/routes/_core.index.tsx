import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import { createFileRoute } from "@tanstack/react-router";

const indexRoute = createFileRoute("/_core/")({
  staticData: {
    breadcrumb: {
      label: "Dashboard",
      visible: false,
      linkOptions: { to: "/" },
    },
  },
  component: App,
});

export const Route = indexRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Dashboard",
      visible: false,
      linkOptions: { to: "/" },
    }),
  },
});

function App() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min">
        {/*  */}
      </div>
    </div>
  );
}
