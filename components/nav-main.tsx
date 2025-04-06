"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: { title: string; url: string }[];
  }[];
}) {
  const router = useRouter();

  return (
    <SidebarGroup data-oid="lla_1hw">
      <SidebarGroupLabel data-oid="m8rob-j">Platform</SidebarGroupLabel>
      <SidebarMenu data-oid="dc9x60c">
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
              data-oid="jsoovwj"
            >
              <SidebarMenuItem data-oid="luccy-h">
                <CollapsibleTrigger asChild data-oid="o_y73p2">
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      // Only navigate if clicking the button itself, not the chevron
                      if (!target.closest(".ml-auto")) {
                        router.push(item.url);
                      }
                    }}
                    data-oid="4fxdz5r"
                  >
                    {item.icon && <item.icon data-oid="k9co-ep" />}
                    <span data-oid="q687vr1">{item.title}</span>
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      data-oid="lkaym0w"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent data-oid=":ib-9ns">
                  <SidebarMenuSub data-oid="hiul-5k">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.title}
                        data-oid="q40djh_"
                      >
                        <SidebarMenuSubButton asChild data-oid="nmse1bj">
                          <a href={subItem.url} data-oid="sm-58ht">
                            <span data-oid="7io-kdn">{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title} data-oid="xy3rvs.">
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                data-oid="zxsawef"
              >
                <a href={item.url} data-oid="24lzyxd">
                  {item.icon && <item.icon data-oid="2o:2:6k" />}
                  <span data-oid=".rgb0al">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
