"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <Layout children={children} />
    </SessionProvider>
  );
}

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = useSession();
  const router = useRouter();

  if (session.status === "loading") {
    return null;
  }
  if (session.status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.data?.user} />
      <main className="w-full overflow-auto bg-background px-4 py-5">
        <SidebarTrigger />
        <div className="py-5">{children}</div>
      </main>
      <ToastContainer
        autoClose={3000}
        position="bottom-right"
        progressStyle={{ background: "#000" }}
        toastClassName={() =>
          "bg-white text-gray-800 text-xs relative flex py-2 px-1 min-h-10 mb-1.5 rounded-md justify-between overflow-hidden cursor-pointer"
        }
      />
    </SidebarProvider>
  );
}
