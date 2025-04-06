import { CycleTimeDashboard } from "@/components/cycle-time-dashboard";
import { DeploymentMetricsDashboard } from "@/components/deployment-metrics-dashboard";
import { PRMetricsDashboard } from "@/components/pr-metrics-dashboard";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <CycleTimeDashboard />
        <PRMetricsDashboard />
        <DeploymentMetricsDashboard />
      </div>
    </div>
  );
}
