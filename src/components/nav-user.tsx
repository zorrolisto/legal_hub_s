"use client";

import { UserGroupIcon } from "@heroicons/react/24/outline";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  HeartHandshake,
  HeartHandshakeIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { ADMINS } from "~/constants";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const isAdmin = ADMINS.includes(user.email);

  const getInitials = (name: string) => {
    const nameArray = name.split(" ");
    if (nameArray.length > 1) {
      return (nameArray[0]?.charAt(0) || "") + (nameArray[1]?.charAt(0) || "");
    }
    return (nameArray[0]?.charAt(0) || "") + (nameArray[0]?.charAt(1) || "");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs font-semibold">
                  {user.name}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs font-semibold">
                    {user.name}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <Link href="/legal/usuarios" className="w-full">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer text-xs">
                    <UserGroupIcon />
                    Usuarios
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </Link>
            )}
            <Link href="/legal/config/soporte" className="w-full">
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer text-xs">
                  <HeartHandshakeIcon />
                  Soporte
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/api/auth/signout" className="w-full">
              <DropdownMenuItem className="cursor-pointer text-xs">
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
