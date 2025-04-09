"use client";

import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Settings2,
  Telescope
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { BreadcrumbClientWrapper } from "./breadcrumb-client-wrapper";
import { NavActions } from "./nav-actions";

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

export function AppSidebar() {
  return (
    <Sidebar data-oid="9.g4ydo" collapsible="icon" variant="inset">
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