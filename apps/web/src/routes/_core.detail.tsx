import { defineBreadcrumb } from "@/lib/router-breadcrumbs";
import { createFileRoute } from "@tanstack/react-router";

const detailRoute = createFileRoute("/_core/detail")({
  staticData: {
    breadcrumb: {
      label: "Detail",
      visible: true,
      linkOptions: { to: "/detail" },
    },
  },
  component: App,
});

export const Route = detailRoute.update({
  staticData: {
    breadcrumb: defineBreadcrumb({
      label: "Detail",
      visible: true,
      linkOptions: { to: "/detail" },
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
