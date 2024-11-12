import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Reyna & Abogados Consultores",
  description: "Consultoría Laboral.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`h-full bg-white ${GeistSans.variable}`}>
      <body className="h-full">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
