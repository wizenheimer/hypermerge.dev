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
    if (change > 0)
      return <ArrowUp className="h-4 w-4 text-green-500" data-oid="k9zhq2." />;
    if (change < 0)
      return <ArrowDown className="h-4 w-4 text-red-500" data-oid="u5z1.qm" />;
    return (
      <ArrowRight className="h-4 w-4 text-orange-500" data-oid="v6chpwc" />
    );
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(1)} hrs`;
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm" data-oid="md_80_u">
      <div className="flex items-center justify-between" data-oid="t638-qy">
        <span className="text-sm text-muted-foreground" data-oid="p82v60-">
          {title}
        </span>
        <div
          className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1"
          data-oid="g0hyyey"
        >
          {getChangeIcon()}
          <span
            className={`text-sm ${
              change > 0
                ? "text-green-500"
                : change < 0
                  ? "text-red-500"
                  : "text-orange-500"
            }`}
            data-oid=".jd5ue1"
          >
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="mt-2" data-oid="-:qcyaw">
        <span className="text-2xl font-bold" data-oid="cagp43w">
          {value} hr
        </span>
      </div>
      <div className="mt-4" data-oid="a2xd3:.">
        <div
          className="flex justify-between text-sm text-muted-foreground"
          data-oid=":0k-6_6"
        >
          <span data-oid="saxv-tw">
            {((currentValue / totalValue) * 100).toFixed(2)}% (
            {formatCurrency(currentValue)})
          </span>
          <span data-oid="5ygxqsv">{formatCurrency(totalValue)}</span>
        </div>
        <div
          className="mt-2 h-2 w-full rounded-full bg-blue-100"
          data-oid="f83ljbj"
        >
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${(currentValue / totalValue) * 100}%` }}
            data-oid="r:u_2.a"
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
    const baseMetrics: Record<string, Record<string, number>> = {
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
    };

    return [
      {
        title: "Coding Time",
        value:
          baseMetrics[range]?.codingTime || baseMetrics["1month"].codingTime,
        change: 5.97,
        progress: 60.29,
        totalValue: 8, // Max hours
        currentValue: 4.8, // Current hours
      },
      {
        title: "Pickup Time",
        value:
          baseMetrics[range]?.pickupTime || baseMetrics["1month"].pickupTime,
        change: -0.97,
        progress: 24.69,
        totalValue: 4, // Max hours
        currentValue: 1, // Current hours
      },
      {
        title: "Review Time",
        value:
          baseMetrics[range]?.reviewTime || baseMetrics["1month"].reviewTime,
        change: 0.02,
        progress: 44.69,
        totalValue: 24, // Max hours
        currentValue: 10.7, // Current hours
      },
      {
        title: "Merge Time",
        value: baseMetrics[range]?.mergeTime || baseMetrics["1month"].mergeTime,
        change: 0.02,
        progress: 44.69,
        totalValue: 4, // Max hours
        currentValue: 1.8, // Current hours
      },
    ];
  };

  const metrics = getMetricsForTimeRange(timeRange);

  return (
    <div className="space-y-4" data-oid="bdyn5oa">
      <div className="flex items-center justify-between" data-oid="y6lnen6">
        <div data-oid="sg-3gch">
          <h2
            className="flex items-center gap-2 text-2xl font-semibold"
            data-oid="d77m7rj"
          >
            Development Velocity
            <span
              className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm text-green-500"
              data-oid="1nr9r63"
            >
              <ArrowUp className="h-4 w-4" data-oid="ujz0ihc" />
              5.97%
            </span>
          </h2>
          <p className="text-sm text-muted-foreground" data-oid="jaapajh">
            Neque porro quisquam est qui dolorem ipsum quia
          </p>
        </div>
        <div className="flex items-center gap-2" data-oid=":a6572m">
          <DropdownMenu data-oid="p:2dri-">
            <DropdownMenuTrigger asChild data-oid="nfs:767">
              <Button variant="outline" size="sm" data-oid="i81jgao">
                {timeRangeOptions.find((opt) => opt.value === timeRange)?.label}
                <ChevronDown className="ml-2 h-4 w-4" data-oid="05c89m8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-oid="19y57.s">
              {timeRangeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  data-oid="xbhrd3f"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2" data-oid="nfu6o-s">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              data-oid="xd0ugn3"
            >
              <ChevronLeft className="h-4 w-4" data-oid="391vjyo" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => p + 1)}
              data-oid="iz31z0s"
            >
              <ChevronRight className="h-4 w-4" data-oid="nxa3glx" />
            </Button>
            <Button variant="outline" size="sm" asChild data-oid="t6ft6lk">
              <Link href="/metrics" data-oid="4r46bca">
                View More
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        data-oid="y.yq-nh"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} data-oid="u-s2xnp" />
        ))}
      </div>
    </div>
  );
}
