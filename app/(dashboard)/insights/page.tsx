"use client";

import { OverviewCompoundChart } from "@/components/charts/OverviewCompoundChart";
import { WorkDistributionOverviewChart } from "@/components/charts/WorkDistributionOverviewChart";
import { PRCalendarChart } from "@/components/charts/PRCalendarChart";
import { CycleTimeCompoundChart } from "@/components/charts/CycleTimeCompoundChart";
import { PRDataTable } from "@/components/charts/PRDataTable";
export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0" data-oid="12c32oz">
      <CycleTimeCompoundChart data-oid="3jbt_vt" />
      <WorkDistributionOverviewChart data-oid="sil_abd" />
      <PRCalendarChart />
      <PRDataTable />
    </div>
  );
}
