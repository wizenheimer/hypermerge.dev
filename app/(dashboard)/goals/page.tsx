import { UserGoalsCompoundChart } from "@/components/charts/UserGoalsCompoundChart";
import { HighRiskCompoundChart } from "@/components/charts/HighRiskCompoundChart";
import { PRMergeTimeCompoundChart } from "@/components/charts/PRMergeTimeCompoundChart";
import { PRPickupCompoundChart } from "@/components/charts/PRPickupCompoundChart";
import { PRReviewCompoundChart } from "@/components/charts/PRReviewCompoundChart";
import { PRReviewTimeCompoundChart } from "@/components/charts/PRReviewTimeCompoundChart";
import { PRSizeCompoundChart } from "@/components/charts/PRSizeCompoundChart";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <UserGoalsCompoundChart />
        <PRSizeCompoundChart />
        <PRReviewCompoundChart />
        <PRPickupCompoundChart />
        <PRReviewTimeCompoundChart />
        <PRMergeTimeCompoundChart />
        <HighRiskCompoundChart />
      </div>
    </div>
  );
}
