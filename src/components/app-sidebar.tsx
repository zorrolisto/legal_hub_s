"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CalendarIcon,
  Command,
  FolderIcon,
  Frame,
  GalleryVerticalEnd,
  Gavel,
  HomeIcon,
  LibraryIcon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { Cog6ToothIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

const data = {
  teams: [
    {
      name: "Reyna & Abogados Consultores",
      logo: Gavel,
      plan: "Consultoría Laboral",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/legal/home",
      icon: HomeIcon,
    },
    {
      title: "Casos Judiciales",
      url: "#",
      icon: FolderIcon,
      isActive: true,
      items: [
        {
          title: "Todos los Casos",
          url: "/legal/expedientes",
        },
        {
          title: "Casos de Laboral",
          url: "/legal/expedientes?search=LABORAL",
        },
        {
          title: "Casos de Penal",
          url: "/legal/expedientes?search=PENAL",
        },
        {
          title: "Casos de Civil",
          url: "/legal/expedientes?search=CIVIL",
        },
      ],
    },
    {
      title: "Documentos",
      url: "/legal/registros",
      icon: LibraryIcon,
    },
    {
      title: "Agenda",
      url: "/legal/agenda",
      icon: CalendarIcon,
    },
    {
      title: "Clientes",
      url: "/legal/clientes",
      icon: UserGroupIcon,
    },
    {
      title: "Configuración",
      url: "#",
      icon: Cog6ToothIcon,
      isActive: false,
      items: [
        {
          title: "Distritos Judiciales",
          url: "/legal/config/distrito-judicial",
        },
        { title: "Materias", url: "/legal/config/especialidad" },
        { title: "Especialistas", url: "/legal/config/especialistas" },
        { title: "Etapas", url: "/legal/config/instancia" },
        {
          title: "Órganos Jurisdiccionales",
          url: "/legal/config/organo-jurisdiccional",
        },
        { title: "Estados", url: "/legal/config/estado" },
        { title: "Biblioteca", url: "/legal/config/biblioteca" },
      ],
    },
  ],
};
export function AppSidebar({
  user,
  ...props
}: {
  user: any;
} & React.ComponentProps<typeof Sidebar>) {
  const session = useSession();

  const items = session.data?.user.email
    ? data.navMain
    : [{ title: "Home", url: "#", icon: HomeIcon }];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: user.image,
            email: user.email,
            name: user.name,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
