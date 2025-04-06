import * as React from "react";
import MetricCard from "./menu-card";
import { cn } from "@/lib/utils";

export interface MetricCardData {
  key: string;
  title: string;
  value: number | string; // Allow string for formatted values like percentages
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
}

interface MetricCardGridProps {
  metrics: MetricCardData[];
  gridClasses: string;
  gap?: string;
  className?: string;
}

export function MetricCardGrid({
  metrics,
  gridClasses,
  gap = "gap-4",
  className = "",
}: MetricCardGridProps) {
  if (!metrics || metrics.length === 0) {
    return null; // Don't render anything if there are no metrics
  }

  return (
    <div className={cn("grid", gridClasses, gap, className)}>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
        />
      ))}
    </div>
  );
}
