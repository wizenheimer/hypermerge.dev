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
  "/metrics": { label: "Metrics" },
  "/goals": { label: "Goals" },
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
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
