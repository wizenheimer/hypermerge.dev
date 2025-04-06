import React from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import ChangeIndicator from "./ChangeIndicator";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeType: "positive" | "negative" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium text-gray-500">
            {title}
          </CardDescription>
          <ChangeIndicator value={change} type={changeType} />
        </div>
        <div className="mt-2 text-2xl font-bold md:text-3xl">{value}</div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
