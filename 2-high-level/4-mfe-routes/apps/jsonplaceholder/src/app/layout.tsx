import type { Metadata } from "next";

import { ModuleBackNav } from "@next-modular-arch/ui-data/module-back-nav/ModuleBackNav";

import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSONPlaceholder",
  description: "Posts de exemplo via JSONPlaceholder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full bg-[var(--color-background)] antialiased dark"
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>
          <ModuleBackNav />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
