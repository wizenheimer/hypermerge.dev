import React from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define route mappings for breadcrumbs
const routeMappings: Record<string, { label: string; parent?: string }> = {
  "/insights": { label: "Insights" },
  "/metrics": { label: "Metrics", parent: "/insights" },
  "/goals": { label: "Goals", parent: "/insights" },
  "/documentation": { label: "Documentation" },
  "/settings": { label: "Settings" },
};

export function generateBreadcrumbs(path: string) {
  const breadcrumbs = [];

  // Add the current path
  if (routeMappings[path]) {
    let currentPath = path;

    // Add the current path and all its parents
    while (currentPath) {
      const route = routeMappings[currentPath];
      if (!route) break;

      breadcrumbs.unshift({
        href: currentPath,
        label: route.label,
      });

      currentPath = route.parent || "";
    }
  }

  return breadcrumbs;
}

export function BreadcrumbNavigation({ path }: { path: string }) {
  const breadcrumbs = generateBreadcrumbs(path);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb data-oid="tf4j1il">
      <BreadcrumbList data-oid="da-m.hv">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem data-oid="z4h1a09">
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage data-oid="po.cs:.">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} asChild data-oid="nncq7vp">
                  <Link href={item.href} data-oid="vy4va8h">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator data-oid="fjwttun" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
