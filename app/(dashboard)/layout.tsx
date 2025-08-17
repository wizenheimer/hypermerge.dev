import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbClientWrapper } from "@/components/breadcrumb-client-wrapper";
import { NavActions } from "@/components/nav-actions";
import Section from "@/components/section-w-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Hypermerge Dashboard",
  description:
    "Engineering metrics and insights dashboard for development teams",
  keywords: [
    "engineering metrics",
    "development",
    "dashboard",
    "analytics",
    "team performance",
  ],
  authors: [{ name: "Hypermerge" }],
  creator: "Hypermerge",
  publisher: "Hypermerge",
  robots: "index, follow",
  openGraph: {
    title: "Hypermerge Dashboard",
    description:
      "Engineering metrics and insights dashboard for development teams",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypermerge Dashboard",
    description:
      "Engineering metrics and insights dashboard for development teams",
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <Section>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadcrumbClientWrapper />
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        {children}
      </Section>
    </SidebarProvider>
  );
}
