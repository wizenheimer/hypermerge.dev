import { CycleTimeCompoundChart } from "@/components/charts/CycleTimeCompoundChart";
import { DeploymentMetricsCompoundChart } from "@/components/charts/DeploymentMetricsCompoundChart";
import { PRMetricsCompoundChart } from "@/components/charts/PRMetricsCompoundChart";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full" data-oid="wx3qs8.">
      <div className="space-y-6" data-oid="q2ngm_x">
        <CycleTimeCompoundChart data-oid="3jbt_vt" />
        <PRMetricsCompoundChart data-oid="xgx._wk" />
        <DeploymentMetricsCompoundChart data-oid="6_.1k4-" />
      </div>
    </div>
  );
}
