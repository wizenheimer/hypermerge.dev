"use client";

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: { name: string; url: string; icon: LucideIcon }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup
      className="group-data-[collapsible=icon]:hidden"
      data-oid="zmpey:a"
    >
      <SidebarGroupLabel data-oid="x7bsqih">Projects</SidebarGroupLabel>
      <SidebarMenu data-oid="hfoo57o">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} data-oid="p5tve7z">
            <SidebarMenuButton asChild data-oid="hdc0h7.">
              <a href={item.url} data-oid="6h1nmjg">
                <item.icon data-oid="13yd4cv" />
                <span data-oid="452h5f-">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu data-oid="m8zn12j">
              <DropdownMenuTrigger asChild data-oid="8iysby_">
                <SidebarMenuAction showOnHover data-oid="rki_6mh">
                  <MoreHorizontal data-oid="fh.cn6t" />
                  <span className="sr-only" data-oid="14gxxbw">
                    More
                  </span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
                data-oid="-2u9s6w"
              >
                <DropdownMenuItem data-oid=".t_l0vs">
                  <Folder
                    className="text-muted-foreground"
                    data-oid="t-bzb5u"
                  />
                  <span data-oid="xjl1gi_">View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem data-oid="m3yss7m">
                  <Forward
                    className="text-muted-foreground"
                    data-oid="_nl:tu-"
                  />
                  <span data-oid="m51uxyn">Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator data-oid="albw1su" />
                <DropdownMenuItem data-oid="jedbzh3">
                  <Trash2
                    className="text-muted-foreground"
                    data-oid="gmh:45l"
                  />
                  <span data-oid="z1:o1hw">Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem data-oid="o3skrvp">
          <SidebarMenuButton
            className="text-sidebar-foreground/70"
            data-oid=":g8b.6n"
          >
            <MoreHorizontal
              className="text-sidebar-foreground/70"
              data-oid="a3m1i2-"
            />
            <span data-oid="faq79rb">More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
