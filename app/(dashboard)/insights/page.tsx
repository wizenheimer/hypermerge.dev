"use client";

import { OverviewCompoundChart } from "@/components/charts/OverviewCompoundChart";
import { WorkDistributionOverviewChart } from "@/components/charts/WorkDistributionOverviewChart";
import { PRCalendarChart } from "@/components/charts/PRCalendarChart";
import { CycleTimeCompoundChart } from "@/components/charts/CycleTimeCompoundChart";
import { PRDataTable } from "@/components/charts/PRDataTable";
import { DeploymentDataTable } from "@/components/charts/DeploymentDataTable";
import { IssuesDataTable } from "@/components/charts/IssuesDataTable";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0" data-oid="12c32oz">
      <CycleTimeCompoundChart showViewMore={true} data-oid="3jbt_vt" />
      <WorkDistributionOverviewChart showViewMore={true} data-oid="sil_abd" />
      <PRCalendarChart showViewMore={true} />
      <PRDataTable />
      <DeploymentDataTable />
      <IssuesDataTable />
    </div>
  );
}
