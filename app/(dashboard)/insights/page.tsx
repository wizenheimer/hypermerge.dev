"use client";

import { CycleTimeCompoundChart } from "@/components/charts/CycleTimeCompoundChart";
import { DeploymentDataTable } from "@/components/charts/DeploymentDataTable";
import { IssuesDataTable } from "@/components/charts/IssuesDataTable";
import { PRCalendarChart } from "@/components/charts/PRCalendarChart";
import { PRDataTable } from "@/components/charts/PRDataTable";
import { TeamGoalsDataTable } from "@/components/charts/TeamGoalsDataTable";
import { WorkDistributionOverviewChart } from "@/components/charts/WorkDistributionOverviewChart";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 w-full" data-oid="12c32oz">
      <CycleTimeCompoundChart showViewMore={true} data-oid="3jbt_vt" />
      <WorkDistributionOverviewChart showViewMore={true} data-oid="sil_abd" />
      <PRCalendarChart showViewMore={true} data-oid="oo.nsu2" />
      <PRDataTable data-oid="uzsnsfq" />
      <DeploymentDataTable data-oid="nl3m8fa" />
      <IssuesDataTable data-oid="993ksw7" />
      <TeamGoalsDataTable data-oid="b-0w9fv" />
    </div>
  );
}
