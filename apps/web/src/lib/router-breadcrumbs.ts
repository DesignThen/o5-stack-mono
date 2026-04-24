import type {
  RegisteredRouter,
  ValidateLinkOptions,
} from "@tanstack/react-router";
import { useMatches } from "@tanstack/react-router";

// Route metadata is the single source of truth for application breadcrumbs.
export type RouteBreadcrumb<TLinkOptions extends object = object> = {
  label: string;
  visible: boolean;
  linkOptions: TLinkOptions;
};

export type ApplicationBreadcrumb<TLinkOptions extends object = object> = {
  id: string;
  title: string;
  linkOptions: TLinkOptions;
};

export function defineBreadcrumb<TOptions extends object>(breadcrumb: {
  label: string;
  visible: boolean;
  linkOptions: ValidateLinkOptions<RegisteredRouter, TOptions>;
}): RouteBreadcrumb<TOptions> {
  return breadcrumb as RouteBreadcrumb<TOptions>;
}

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    breadcrumb: RouteBreadcrumb<object>;
  }
}

export function useApplicationBreadcrumbs() {
  return useMatches({
    select: (matches) =>
      matches.flatMap((match) => {
        const breadcrumb = match.staticData.breadcrumb;

        if (!breadcrumb.visible) {
          return [];
        }

        return [
          {
            id: match.id,
            title: breadcrumb.label,
            linkOptions: breadcrumb.linkOptions,
          } satisfies ApplicationBreadcrumb<object>,
        ];
      }),
  });
}
