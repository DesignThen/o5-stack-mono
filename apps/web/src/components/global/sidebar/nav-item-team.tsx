"use client";

import * as Persona from "@/components/persona";
import { useClerk } from "@clerk/tanstack-react-start";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronDownIcon, CogIcon, PlusIcon } from "lucide-react";
import * as React from "react";

interface TeamButtonProps extends React.ComponentProps<
  typeof SidebarMenuButton
> {
  persona: Persona.TeamData | null;
}

function TeamButton({
  persona,
  size = "lg",
  className,
  ...props
}: TeamButtonProps) {
  return (
    <SidebarMenuButton
      size={size}
      className={cn(
        "aria-expanded:bg-muted aria-expanded:text-foreground",
        className,
      )}
      {...props}
    >
      <Persona.TeamAvatar fallback="app" persona={persona} className="size-8" />
      <Persona.TeamDetails fallback="app" persona={persona} />

      {persona && <ChevronDownIcon className="opacity-50" />}
    </SidebarMenuButton>
  );
}

export function NavItemTeam({
  children,
  ...props
}: React.ComponentProps<typeof SidebarMenuItem>) {
  const {
    organization,
    openOrganizationProfile,
    user,
    setActive,
    openCreateOrganization,
    loaded,
  } = useClerk();

  if (!loaded) {
    return (
      <TeamButton
        render={<Link to="/" />}
        persona={{
          name: "Loading...",
          subtitle: undefined,
          logo: undefined,
        }}
      />
    );
  }

  if (!user) {
    return <TeamButton render={<Link to="/" />} persona={null} />;
  }

  if (!organization) {
    return (
      <TeamButton
        render={<Link to="/" />}
        persona={{
          name: "Organization",
          subtitle: undefined,
          logo: undefined,
        }}
      />
    );
  }

  const persona: Persona.TeamData = {
    name: organization.name,
    logo: organization.imageUrl,
    subtitle:
      organization.membersCount === 1
        ? "1 Member"
        : `${organization.membersCount} Members`,
  };

  return (
    <SidebarMenuItem {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<TeamButton persona={persona} />} />

        <DropdownMenuContent
          className="w-64 rounded-lg"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => openOrganizationProfile()}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <CogIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Manage {persona.name}
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              My Organizations
            </DropdownMenuLabel>
            {user.organizationMemberships.map((membership) => (
              <DropdownMenuItem
                key={membership.id}
                onClick={() =>
                  setActive({ organization: membership.organization })
                }
                className="gap-2 p-2"
              >
                <Persona.TeamAvatar
                  persona={{
                    logo: membership.organization.imageUrl,
                    name: membership.organization.name,
                  }}
                  className="size-6"
                />

                {membership.organization.name}
                <DropdownMenuLabel>
                  {membership.organization.membersCount === 1
                    ? `1 Member`
                    : `${membership.organization.membersCount} Members`}
                </DropdownMenuLabel>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => openCreateOrganization()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create Organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {children}
    </SidebarMenuItem>
  );
}
