"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";

export function BreadcrumbClientWrapper() {
  const pathname = usePathname();
  return <BreadcrumbNavigation path={pathname} />;
}
