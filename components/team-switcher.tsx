"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: { name: string; logo: React.ElementType; plan: string }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu data-oid="xk7.fyg">
      <SidebarMenuItem data-oid="gewi4e4">
        <DropdownMenu data-oid="sxcpvqs">
          <DropdownMenuTrigger asChild data-oid=".ww0ya9">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-oid="pv-ozcy"
            >
              <div
                className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                data-oid="pwaq4xc"
              >
                <activeTeam.logo className="size-4" data-oid="fzkj-r." />
              </div>
              <div
                className="grid flex-1 text-left text-sm leading-tight"
                data-oid="dwddp3i"
              >
                <span className="truncate font-medium" data-oid="f.g0em:">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs" data-oid="ovz.ymn">
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" data-oid="20v_02a" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            data-oid="6awm6t-"
          >
            <DropdownMenuLabel
              className="text-muted-foreground text-xs"
              data-oid="m2z:_7."
            >
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
                data-oid="q:tgnfp"
              >
                <div
                  className="flex size-6 items-center justify-center rounded-md border"
                  data-oid="j87sf-6"
                >
                  <team.logo className="size-3.5 shrink-0" data-oid="h.p8yu1" />
                </div>
                {team.name}
                <DropdownMenuShortcut data-oid="cs-p_ce">
                  ⌘{index + 1}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator data-oid="7loyq4y" />
            <DropdownMenuItem className="gap-2 p-2" data-oid="i2iowed">
              <div
                className="flex size-6 items-center justify-center rounded-md border bg-transparent"
                data-oid="p_b4j68"
              >
                <Plus className="size-4" data-oid="d2x71ht" />
              </div>
              <div
                className="text-muted-foreground font-medium"
                data-oid="6dfipwr"
              >
                Add team
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
