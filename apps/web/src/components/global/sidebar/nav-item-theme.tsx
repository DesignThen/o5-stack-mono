"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { THEME, useTheme } from "@repo/ui/hooks/use-theme";
import React from "react";

type ButtonProps = Omit<
  React.ComponentProps<typeof SidebarMenuButton>,
  "children" | "render" | "isActive"
>;

export interface ActionProps extends ButtonProps {}

export function NavItemTheme({
  children,
  ...props
}: React.ComponentProps<typeof SidebarMenuItem>) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  const currentTheme = THEME[theme];

  return (
    <SidebarMenuItem {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton />}>
          <currentTheme.icon />
          {currentTheme.name}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-56"
          side={isMobile ? "bottom" : "right"}
          align="start"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            {Object.values(THEME).map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                aria-label={`Select ${t.name} Mode`}
              >
                <t.icon /> {t.name}
                {theme === t.id && (
                  <DropdownMenuShortcut className="uppercase">
                    Selected
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {children}
    </SidebarMenuItem>
  );
}
