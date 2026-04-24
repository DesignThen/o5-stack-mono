import { useApplicationBreadcrumbs } from "@/lib/router-breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

interface CrumbProps<
  TLinkOptions extends object = object,
> extends React.ComponentProps<typeof BreadcrumbItem> {
  linkOptions?: TLinkOptions;
}

function Crumb({ children, linkOptions, ...props }: CrumbProps) {
  return (
    <BreadcrumbItem {...props}>
      {linkOptions ? (
        <BreadcrumbLink
          render={<Link {...(linkOptions as Parameters<typeof Link>[0])} />}
        >
          {children}
        </BreadcrumbLink>
      ) : (
        <BreadcrumbPage className="line-clamp-1">{children}</BreadcrumbPage>
      )}
    </BreadcrumbItem>
  );
}

export function AppBreadcrumbs(props: React.ComponentProps<typeof Breadcrumb>) {
  const data = useApplicationBreadcrumbs();

  if (data.length === 0) {
    return null;
  }

  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {data.map((crumb, ix) => {
          if (ix === data.length - 1) {
            return <Crumb key={crumb.id}>{crumb.title}</Crumb>;
          }

          return (
            <Fragment key={crumb.id}>
              <Crumb linkOptions={crumb.linkOptions}>{crumb.title}</Crumb>
              <BreadcrumbSeparator className="hidden md:block" />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
