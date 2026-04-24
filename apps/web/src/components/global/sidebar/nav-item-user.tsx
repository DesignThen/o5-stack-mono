"use client";

import * as SignOut from "@/components/opener/sign-out-dialog";
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
  useSidebar,
} from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import {
  ChevronsUpDownIcon,
  CogIcon,
  LogOutIcon,
  SparklesIcon,
  UserCircleIcon,
} from "lucide-react";

export function NavItemUser({
  children,
  ...props
}: React.ComponentProps<typeof SidebarMenuItem>) {
  const { openUserProfile, user, openWaitlist } = useClerk();
  const { isMobile } = useSidebar();

  if (!user) {
    return (
      <SidebarMenuItem {...props}>
        <SidebarMenuButton
          render={<Link to="/sign-in/$" search={{ redirect: undefined }} />}
          size="lg"
          className="aria-expanded:bg-muted aria-expanded:text-foreground"
        >
          <div className="size-8 grid place-items-center bg-muted text-muted-foreground rounded-full">
            <UserCircleIcon />
          </div>

          <Persona.UserDetails
            persona={{ name: "Login", subtitle: "Signup" }}
          />
        </SidebarMenuButton>

        {children}
      </SidebarMenuItem>
    );
  }

  const persona: Persona.UserData = {
    name: user.fullName ?? user.firstName ?? user.username ?? "You",
    avatar: user.imageUrl,
    subtitle: user.username ?? undefined,
  };

  return (
    <SidebarMenuItem {...props}>
      <SignOut.Root>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted aria-expanded:text-foreground"
              />
            }
          >
            <Persona.UserAvatar persona={persona} />
            <Persona.UserDetails persona={persona} />

            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Persona.UserAvatar persona={persona} />
                  <Persona.UserDetails persona={persona} />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <CogIcon />
                Manage Account
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openWaitlist()}>
                <SparklesIcon />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <SignOut.Trigger
                render={<DropdownMenuItem variant="destructive" />}
              >
                <LogOutIcon />
                Sign out
              </SignOut.Trigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignOut.Root>

      {children}
    </SidebarMenuItem>
  );
}
