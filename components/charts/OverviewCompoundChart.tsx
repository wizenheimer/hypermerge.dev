"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  progress: number;
  totalValue: number;
  currentValue: number;
}

function MetricCard({
  title,
  value,
  change,
  progress,
  totalValue,
  currentValue,
}: MetricCardProps) {
  const getChangeIcon = () => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <ArrowRight className="h-4 w-4 text-orange-500" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
          {getChangeIcon()}
          <span
            className={`text-sm ${
              change > 0
                ? "text-green-500"
                : change < 0
                ? "text-red-500"
                : "text-orange-500"
            }`}
          >
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value} hr</span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {((currentValue / totalValue) * 100).toFixed(2)}% (
            {formatCurrency(currentValue)})
          </span>
          <span>{formatCurrency(totalValue)}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${(currentValue / totalValue) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const timeRangeOptions = [
  { label: "15 Days", value: "15days" },
  { label: "1 Month", value: "1month" },
  { label: "3 Months", value: "3month" },
];

export function OverviewCompoundChart() {
  const [timeRange, setTimeRange] = React.useState("1month");
  const [currentPage, setCurrentPage] = React.useState(0);

  // Simulated data for different time periods
  const getMetricsForTimeRange = (range: string) => {
    // Base metrics
    const baseMetrics =
      {
        "15days": {
          codingTime: 2.1,
          pickupTime: 1.1,
          reviewTime: 10.5,
          mergeTime: 1.3,
        },
        "1month": {
          codingTime: 2.4,
          pickupTime: 1.3,
          reviewTime: 11.8,
          mergeTime: 1.5,
        },
        "3month": {
          codingTime: 2.8,
          pickupTime: 1.5,
          reviewTime: 12.2,
          mergeTime: 1.7,
        },
      }[range] || baseMetrics["1month"];

    return [
      {
        title: "Coding Time",
        value: baseMetrics.codingTime,
        change: 5.97,
        progress: 60.29,
        totalValue: 250000,
        currentValue: 150736,
      },
      {
        title: "Pickup Time",
        value: baseMetrics.pickupTime,
        change: -0.97,
        progress: 24.69,
        totalValue: 250000,
        currentValue: 61736,
      },
      {
        title: "Review Time",
        value: baseMetrics.reviewTime,
        change: 0.02,
        progress: 44.69,
        totalValue: 250000,
        currentValue: 61736,
      },
      {
        title: "Merge Time",
        value: baseMetrics.mergeTime,
        change: 0.02,
        progress: 44.69,
        totalValue: 250000,
        currentValue: 61736,
      },
    ];
  };

  const metrics = getMetricsForTimeRange(timeRange);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            Development Velocity
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm text-green-500">
              <ArrowUp className="h-4 w-4" />
              5.97%
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Neque porro quisquam est qui dolorem ipsum quia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {timeRangeOptions.find((opt) => opt.value === timeRange)?.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {timeRangeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/metrics">View More</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  );
}
