import { GoalsDashboard } from "@/components/goals-dashboard";
import { HighRiskGoalsDashboard } from "@/components/high-risk-goals-dashboard";
import { PRMergeTimeGoalsDashboard } from "@/components/pr-merge-time-goals-dashboard";
import { PRPickupGoalsDashboard } from "@/components/pr-pickup-goals-dashboard";
import { PRReviewGoalsDashboard } from "@/components/pr-review-goals-dashboard";
import { PRReviewTimeGoalsDashboard } from "@/components/pr-review-time-goals-dashboard";
import { PRSizeGoalsDashboard } from "@/components/pr-size-goals-dashboard";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <GoalsDashboard />
        <PRSizeGoalsDashboard />
        <PRReviewGoalsDashboard />
        <PRPickupGoalsDashboard />
        <PRReviewTimeGoalsDashboard />
        <PRMergeTimeGoalsDashboard />
        <HighRiskGoalsDashboard />
      </div>
    </div>
  );
}
