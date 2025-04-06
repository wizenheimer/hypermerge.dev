import { CycleTimeCompoundChart } from "@/components/charts/CycleTimeCompoundChart";
import { DeploymentMetricsCompoundChart } from "@/components/charts/DeploymentMetricsCompoundChart";
import { PRMetricsCompoundChart } from "@/components/charts/PRMetricsCompoundChart";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <CycleTimeCompoundChart />
        <PRMetricsCompoundChart />
        <DeploymentMetricsCompoundChart />
      </div>
    </div>
  );
}
