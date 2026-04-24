"use client";
import { COMPANY } from "@/lib/constants";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/utils";
import { BuildingIcon } from "lucide-react";

export type UserData = {
  name: string;
  subtitle?: string | undefined;
  avatar: string | undefined;
};

function formatInitials(str: string) {
  const initials = str
    .normalize()
    .trim()
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean);

  if (initials.length > 2) {
    initials.length = 2;
  }

  return initials.join("").toUpperCase();
}

export function UserDetails({
  className,
  children,
  persona,
  ...props
}: React.ComponentProps<"div"> & {
  persona: Pick<UserData, "name" | "subtitle">;
}) {
  return (
    <div
      className={cn("grid flex-1 text-left text-sm leading-tight", className)}
      {...props}
    >
      <span className="truncate font-medium text-card-foreground">
        {persona.name}
      </span>
      {persona.subtitle && (
        <span className="truncate text-xs">{persona.subtitle}</span>
      )}
      {children}
    </div>
  );
}

export function UserAvatar({
  children,
  persona,
  ...props
}: React.ComponentProps<typeof Avatar> & {
  persona: Pick<UserData, "name" | "avatar">;
}) {
  const initials = formatInitials(persona.name);

  return (
    <Avatar {...props}>
      <AvatarImage src={persona.avatar} alt={persona.name} />
      <AvatarFallback>{initials}</AvatarFallback>
      {children}
    </Avatar>
  );
}

export type TeamData = {
  name: string;
  subtitle?: string | undefined;
  logo: string | undefined;
};

const fallbackTeamData = {
  app: {
    name: COMPANY.siteName,
    icon: COMPANY.icon,
  },

  organization: {
    name: "Organization",
    icon: BuildingIcon,
  },
} as const;

export function TeamDetails({
  className,
  children,
  persona,
  isLoading = false,
  fallback = "organization",
  ...props
}: React.ComponentProps<"div"> & {
  persona: Pick<TeamData, "name" | "subtitle"> | null;
  fallback?: keyof typeof fallbackTeamData;
  isLoading?: boolean;
}) {
  const fallbackData = fallbackTeamData[fallback];

  return (
    <div
      className={cn("grid flex-1 text-left text-sm leading-tight", className)}
      {...props}
    >
      <span className="truncate font-medium">
        {isLoading ? "Loading" : (persona?.name ?? fallbackData.name)}
      </span>
      {persona?.subtitle && (
        <span className="truncate text-xs">{persona.subtitle}</span>
      )}
      {children}
    </div>
  );
}

export function TeamAvatar({
  children,
  persona,
  className,
  isLoading = false,
  fallback = "organization",
  ...props
}: React.ComponentProps<"div"> & {
  persona: Pick<TeamData, "logo" | "name"> | null;
  fallback?: keyof typeof fallbackTeamData;
  isLoading?: boolean;
}) {
  const fallbackData = fallbackTeamData[fallback];

  return (
    <div
      aria-label={isLoading ? "Loading" : (persona?.name ?? fallbackData.name)}
      className={cn(
        "aspect-square ring-1 ring-white/5 overflow-hidden size-6 grid place-items-center rounded-md bg-card text-card-foreground relative",
        className,
      )}
      {...props}
    >
      {persona?.logo ? (
        <img
          src={persona.logo}
          alt={persona.name}
          className="object-cover object-center absolute inset-0"
          width={80}
          height={80}
        />
      ) : (
        <fallbackData.icon />
      )}
    </div>
  );
}
