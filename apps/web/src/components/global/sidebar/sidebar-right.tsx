import * as React from "react";

import * as SidebarMenuItemType from "@/components/global/sidebar/nav-item";
import { NavItemUser } from "@/components/global/sidebar/nav-item-user";
import { sidebarDemoData } from "@/components/global/sidebar/sidebar-demo-data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "@repo/ui/components/sidebar";
import { PlusIcon } from "lucide-react";

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <SidebarMenu>
          <NavItemUser />
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarDemoData.detailPages.map((item) => (
                <SidebarMenuItemType.Detail key={item.title} item={item} />
              ))}

              <SidebarMenuItemType.Action
                className="text-sidebar-foreground/70"
                item={{
                  title: "Load More",
                  onClick: () => alert("todo..."),
                }}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItemType.Action
            item={{
              icon: <PlusIcon />,
              title: "Load More",
              onClick: () => alert("todo..."),
            }}
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
