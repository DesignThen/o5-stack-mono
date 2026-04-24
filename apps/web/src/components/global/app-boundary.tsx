import { env } from "@/env";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import * as Sentry from "@sentry/tanstackstart-react";
import type {
  ErrorRouteComponent,
  NotFoundRouteComponent,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  BadgeQuestionMark,
  InboxIcon,
  OctagonXIcon,
  RefreshCwIcon,
} from "lucide-react";
import * as React from "react";

const ERROR_DEFAULTS = {
  title: "Something went wrong",
  description: "Our team have been notified of this error.",
  advice: "Try again soon. If the problem persists, please contact support.",
} as const;

const NOT_FOUND_DEFAULTS = {
  title: "We couldn't find that!",
  description: "The page you are looking for has been moved or does not exist.",
  advice: "Double check the URL, or request access to the page again.",
} as const;

export interface BoundaryProps extends React.ComponentProps<typeof Empty> {
  readonly title?: string;
  readonly description?: string;
  readonly advice?: string;
  readonly technicalDetails?: Record<string, unknown> | null | undefined;
}

function TechnicalDetailsSection({
  details,
}: {
  readonly details: Record<string, unknown>;
}): React.ReactElement {
  return (
    <>
      <Separator />
      <EmptyContent>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Technical Details
        </p>
        <pre className="bg-muted w-full overflow-auto rounded-md border p-4 text-left font-mono select-all">
          {JSON.stringify(details, null, 2)}
        </pre>
      </EmptyContent>
    </>
  );
}

function Error({
  title = ERROR_DEFAULTS.title,
  description = ERROR_DEFAULTS.description,
  advice,
  technicalDetails,
  children,
  className,
  ...props
}: BoundaryProps): React.ReactElement {
  return (
    <Empty
      data-slot="boundary-error"
      className={cn(
        "bg-card dark:bg-background ring-destructive ring-2",
        className,
      )}
      {...props}
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-destructive/10 text-destructive"
        >
          <OctagonXIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description}{" "}
          {advice && <span className="font-medium">{advice}</span>}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
      {technicalDetails && (
        <TechnicalDetailsSection details={technicalDetails} />
      )}
    </Empty>
  );
}

function NotFound({
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  advice,
  technicalDetails,
  children,
  className,
  ...props
}: BoundaryProps): React.ReactElement {
  return (
    <Empty
      data-slot="boundary-not-found"
      className={cn(
        "bg-card dark:bg-background ring-warning ring-2",
        className,
      )}
      {...props}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-warning/10 text-warning">
          <BadgeQuestionMark />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description}{" "}
          {advice && <span className="font-medium">{advice}</span>}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
      {technicalDetails && (
        <TechnicalDetailsSection details={technicalDetails} />
      )}
    </Empty>
  );
}

function SharedPageLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "xs:p-1 @container/page relative z-0 flex flex-1 flex-col gap-4 p-0.5 md:p-2",
        "grid place-items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const DefaultError: ErrorRouteComponent = ({ error, reset, info }) => {
  const context = {
    name: error.name,
    message: error.message,
    info,
  };

  // Report non-recoverable errors to Sentry
  React.useEffect(() => {
    if (env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: { boundary: "route" },
        contexts: {
          routeError: {
            componentStack: info?.componentStack,
          },
        },
      });
    }
  }, [error, info]);

  return (
    <SharedPageLayout>
      <Error advice={ERROR_DEFAULTS.advice} technicalDetails={context}>
        <ButtonGroup>
          <Button variant="outline" render={<Link to="/" />}>
            <InboxIcon /> Inbox
          </Button>
          <Button variant="outline" onClick={reset}>
            <RefreshCwIcon /> Retry
          </Button>
        </ButtonGroup>
      </Error>
    </SharedPageLayout>
  );
};

export const DefaultNotFound: NotFoundRouteComponent = ({ data, ...props }) => {
  const technicalDetails =
    typeof data === "object" ? (data as Record<string, unknown>) : undefined;

  return (
    <SharedPageLayout {...props}>
      <NotFound
        advice={NOT_FOUND_DEFAULTS.advice}
        technicalDetails={technicalDetails}
      >
        <ButtonGroup>
          <Button variant="outline" render={<Link to="/" />}>
            <InboxIcon /> Inbox
          </Button>
        </ButtonGroup>
      </NotFound>
    </SharedPageLayout>
  );
};
