import React from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import ChangeIndicator from "./change-indicator";

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
}) => {
  return (
    <Card
      className="overflow-hidden border-none shadow-none"
      data-oid="cn9ki2c"
    >
      <CardContent className="p-4" data-oid="u9eo7s1">
        <div className="flex items-center justify-between" data-oid="or0jcsq">
          <CardDescription
            className="text-sm font-medium text-gray-500"
            data-oid="oelz10r"
          >
            {title}
          </CardDescription>
          {change !== undefined && changeType && (
            <ChangeIndicator
              value={change}
              type={changeType}
              data-oid="-8grqaa"
            />
          )}
        </div>
        <div className="mt-2 text-2xl font-bold md:text-3xl" data-oid="b:_xd90">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
