"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import Avatar from "boring-avatars";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: { name: string; email: string; avatar: string };
}) {
  const { isMobile, state } = useSidebar();

  return (
    <SidebarMenu data-oid="rrh3:si">
      <SidebarMenuItem data-oid="149u9q-">
        <DropdownMenu data-oid="hqm-c.a">
          <DropdownMenuTrigger asChild data-oid="s82x7x3">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-oid="j5z65_v"
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-lg overflow-hidden",
                  state === "collapsed" && "mx-auto"
                )}
                data-oid="xkk1_3i"
              >
                <Avatar
                  name={user.name}
                  colors={[
                    "#332e1d",
                    "#5ac7aa",
                    "#9adcb9",
                    "#fafcd3",
                    "#efeba9",
                  ]}
                  variant="beam"
                  size={32}
                />
              </div>
              <div
                className={cn(
                  "grid flex-1 text-left text-sm leading-tight",
                  state === "collapsed" && "hidden"
                )}
                data-oid="1j_uvlg"
              >
                <span className="truncate font-medium" data-oid="c7l6h4i">
                  {user.name}
                </span>
                <span className="truncate text-xs" data-oid="stut1g-">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown
                className={cn(
                  "ml-auto size-4",
                  state === "collapsed" && "hidden"
                )}
                data-oid="677l5-q"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            data-oid="sgge8tj"
          >
            <DropdownMenuLabel className="p-0 font-normal" data-oid="s.hzkaj">
              <div
                className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                data-oid="kdon6tp"
              >
                <div
                  className="h-8 w-8 rounded-lg overflow-hidden"
                  data-oid="umbo6f3"
                >
                  <Avatar
                    name={user.name}
                    colors={[
                      "#332e1d",
                      "#5ac7aa",
                      "#9adcb9",
                      "#fafcd3",
                      "#efeba9",
                    ]}
                    variant="beam"
                    size={32}
                  />
                </div>
                <div
                  className="grid flex-1 text-left text-sm leading-tight"
                  data-oid="t5qb6ws"
                >
                  <span className="truncate font-medium" data-oid="90ay.hn">
                    {user.name}
                  </span>
                  <span className="truncate text-xs" data-oid="aw5.v:u">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator data-oid=".8v3o0s" />
            <DropdownMenuGroup data-oid="0.16i2m">
              <DropdownMenuItem data-oid="k8v6bpw">
                <Sparkles data-oid="rxqckh." />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator data-oid="479::dr" />
            <DropdownMenuGroup data-oid="akhetor">
              <DropdownMenuItem data-oid="kfukyx2">
                <BadgeCheck data-oid="tozrg2d" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem data-oid="1bm7ev2">
                <CreditCard data-oid="fh1gdgx" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem data-oid="xrep1-x">
                <Bell data-oid="spnnv.3" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator data-oid="ii5er5h" />
            <DropdownMenuItem data-oid="sr7b8lr">
              <LogOut data-oid="4cmseyu" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
