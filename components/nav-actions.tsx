"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  MoreHorizontal,
  RefreshCcw,
  Send,
  Settings2,
  Star,
  Trash,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = [
  [
    {
      label: "Customize View",
      icon: Settings2,
    },
    {
      label: "Duplicate View",
      icon: Copy,
    },
    {
      label: "Prepare Report",
      icon: FileText,
    },
    {
      label: "Share Report",
      icon: Send,
    },
  ],

  [
    {
      label: "Copy Link",
      icon: Link,
    },

    {
      label: "Remove View",
      icon: Trash2,
    },
  ],

  [
    {
      label: "Import",
      icon: ArrowUp,
    },
    {
      label: "Export",
      icon: ArrowDown,
    },
  ],
];

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm" data-oid="0jw2roq">
      <div
        className="hidden font-medium text-muted-foreground md:inline-block"
        data-oid="m1ojgig"
      >
        Sync: 08 Oct
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        data-oid="xs05_.0"
      >
        <RefreshCcw data-oid=":by9qvg" />
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen} data-oid="dwe0j9g">
        <PopoverTrigger asChild data-oid="m85d3wd">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
            data-oid="-2wwphn"
          >
            <MoreHorizontal data-oid=":fwo7-g" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
          data-oid="gbx2tew"
        >
          <Sidebar
            collapsible="none"
            className="bg-transparent"
            data-oid="se8k60v"
          >
            <SidebarContent data-oid="7mcm0g3">
              {data.map((group, index) => (
                <SidebarGroup
                  key={index}
                  className="border-b last:border-none"
                  data-oid="r8jg78e"
                >
                  <SidebarGroupContent className="gap-0" data-oid="t-q.70m">
                    <SidebarMenu data-oid="-v4aqun">
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index} data-oid="4.ahd:g">
                          <SidebarMenuButton data-oid="1wpr-kg">
                            <item.icon data-oid="-zly1iy" />{" "}
                            <span data-oid="6f6npjz">{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
