import { UserGoalsCompoundChart } from "@/components/charts/UserGoalsCompoundChart";
import { HighRiskCompoundChart } from "@/components/charts/HighRiskCompoundChart";
import { PRMergeTimeCompoundChart } from "@/components/charts/PRMergeTimeCompoundChart";
import { PRPickupCompoundChart } from "@/components/charts/PRPickupCompoundChart";
import { PRReviewCompoundChart } from "@/components/charts/PRReviewCompoundChart";
import { PRReviewTimeCompoundChart } from "@/components/charts/PRReviewTimeCompoundChart";
import { PRSizeCompoundChart } from "@/components/charts/PRSizeCompoundChart";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0" data-oid="6au9xhr">
      <div className="space-y-6" data-oid="z_m1uaw">
        <UserGoalsCompoundChart data-oid="inn5um4" />
        <PRSizeCompoundChart data-oid="yttya3f" />
        <PRReviewCompoundChart data-oid="bj_lals" />
        <PRPickupCompoundChart data-oid="7gd-idd" />
        <PRReviewTimeCompoundChart data-oid="a2jb4dp" />
        <PRMergeTimeCompoundChart data-oid=".z7us2d" />
        <HighRiskCompoundChart data-oid="n-5cjfn" />
      </div>
    </div>
  );
}
