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
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Sync: 08 Oct
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <RefreshCcw />
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            <item.icon /> <span>{item.label}</span>
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
