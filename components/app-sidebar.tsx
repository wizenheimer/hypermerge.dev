"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Target,
  Telescope,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],

  navMain: [
    {
      title: "Insights",
      url: "/insights",
      icon: Telescope,
      items: [
        {
          title: "Metrics",
          url: "/metrics",
        },
        {
          title: "Goals",
          url: "/goals",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#Documentation",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "#Settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      {...props}
      data-oid="9.g4ydo"
    >
      <SidebarHeader data-oid="vkxzylr">
        <TeamSwitcher teams={data.teams} data-oid="-mx2ftf" />
      </SidebarHeader>
      <SidebarContent data-oid="_2jpsmq">
        <NavMain items={data.navMain} data-oid="_kr4ym6" />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter data-oid="hbfi335">
        <NavUser user={data.user} data-oid="nif5wn1" />
      </SidebarFooter>
      <SidebarRail data-oid="9m0bjqr" />
    </Sidebar>
  );
}
