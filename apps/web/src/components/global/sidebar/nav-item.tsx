"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import type {
  RegisteredRouter,
  ValidateLinkOptions,
} from "@tanstack/react-router";
import { Link, useLinkProps } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  LinkIcon,
  MoreHorizontalIcon,
  StarOffIcon,
  Trash2Icon,
} from "lucide-react";
import React from "react";

type ButtonProps = Omit<
  React.ComponentProps<typeof SidebarMenuButton>,
  "children" | "render" | "isActive"
>;

export interface LinkItem<TLinkOptions = unknown> {
  title: string;
  linkOptions: ValidateLinkOptions<RegisteredRouter, TLinkOptions>;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export interface RouteProps<TLinkOptions = unknown> extends ButtonProps {
  item: LinkItem<TLinkOptions>;
}

function RouteButton({ item, ...props }: RouteProps) {
  const isActive =
    (
      useLinkProps(
        item.linkOptions as Parameters<typeof useLinkProps>[0],
      ) as React.ComponentPropsWithRef<"a"> & {
        "data-status"?: "active";
      }
    )["data-status"] === "active";

  return (
    <SidebarMenuButton
      render={<Link {...item.linkOptions} title={item.title} />}
      isActive={isActive}
      {...props}
    >
      {item.icon}
      <span>{item.title}</span>
    </SidebarMenuButton>
  );
}

export function Page<TLinkOptions>(
  props: RouteProps<TLinkOptions>,
): React.ReactNode;
export function Page({ item, ...props }: RouteProps) {
  return (
    <SidebarMenuItem key={item.title}>
      <RouteButton item={item} {...props} />
      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

export function Detail<TLinkOptions>(
  props: RouteProps<TLinkOptions>,
): React.ReactNode;
export function Detail({ item, ...props }: RouteProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenuItem key={item.title}>
      <RouteButton item={item} {...props} />
      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover className="aria-expanded:bg-muted" />
          }
        >
          <MoreHorizontalIcon />
          <span className="sr-only">More</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem>
            <StarOffIcon className="text-muted-foreground" />
            <span>Remove from Favorites</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Trash2Icon className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

export interface ActionProps extends ButtonProps {
  item: {
    title: string;
    onClick: () => void;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
  };
}

export function Action({ item, ...props }: ActionProps) {
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton {...props}>
        {item.icon ? item.icon : <MoreHorizontalIcon />}
        <span>{item.title}</span>
      </SidebarMenuButton>
      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}
