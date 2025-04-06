"use client";

import { OverviewCompoundChart } from "@/components/charts/OverviewCompoundChart";
import { WorkDistributionOverviewChart } from "@/components/charts/WorkDistributionOverviewChart";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <OverviewCompoundChart />
      <WorkDistributionOverviewChart />
    </div>
  );
}
