"use client";

import * as React from "react";
import { ArrowUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResponsiveContainer, Sankey, Layer, Rectangle } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { blueColors } from "@/lib/colors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const timeRangeOptions = [
  { label: "15 Days", value: "15days" },
  { label: "1 Month", value: "1month" },
  { label: "3 Months", value: "3month" },
];

const viewOptions = [
  { label: "PR Count", value: "count" },
  { label: "Time Focus", value: "time" },
];

interface Metrics {
  Features: number;
  Bugs: number;
  Chore: number;
  Documentation: number;
  Enhancement: number;
  Security: number;
}

interface PRStatus {
  merged: number;
  closed: number;
  open: number;
}

interface PRMetrics {
  [key: string]: PRStatus;
}

type MetricKey = keyof Metrics;

interface BaseMetric {
  count: number;
  timeRange: { min: number; max: number };
  complexity: number;
}

type BaseMetrics = Record<MetricKey, BaseMetric>;

// Realistic base metrics for 15 days
const baseMetrics15Days: BaseMetrics = {
  Features: {
    count: 15, // ~1 feature PR per day
    timeRange: { min: 4, max: 12 }, // hours per PR
    complexity: 1.2, // multiplier for time variance
  },
  Bugs: {
    count: 24, // ~1.6 bug fixes per day
    timeRange: { min: 1, max: 6 }, // hours per PR
    complexity: 0.8,
  },
  Chore: {
    count: 12, // ~0.8 chores per day
    timeRange: { min: 1, max: 4 }, // hours per PR
    complexity: 0.6,
  },
  Documentation: {
    count: 9, // ~0.6 docs per day
    timeRange: { min: 1, max: 3 }, // hours per PR
    complexity: 0.4,
  },
  Enhancement: {
    count: 18, // ~1.2 enhancements per day
    timeRange: { min: 2, max: 8 }, // hours per PR
    complexity: 1.0,
  },
  Security: {
    count: 6, // ~0.4 security fixes per day
    timeRange: { min: 3, max: 10 }, // hours per PR
    complexity: 1.5,
  },
};

// Helper function to generate random number within range
const getRandomInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to add realistic variance
const addVariance = (base: number, variance: number = 0.2) => {
  const randomVariance = (Math.random() - 0.5) * 2 * variance;
  return Math.round(base * (1 + randomVariance));
};

// Helper function for scaled metrics with randomness
function getScaledMetrics(
  multiplier: number,
  trendFactor: number = 1
): Metrics {
  const result = {} as Metrics;

  (Object.entries(baseMetrics15Days) as [MetricKey, BaseMetric][]).forEach(
    ([key, value]) => {
      // Base count with trend
      const baseCount = value.count * multiplier * (1 + 0.1 * trendFactor);
      // Add daily variance
      const daysInPeriod = multiplier * 15;
      let totalCount = 0;

      // Simulate daily variations
      for (let i = 0; i < daysInPeriod; i++) {
        const dailyBase = baseCount / daysInPeriod;
        const dailyCount = addVariance(dailyBase, 0.3);
        totalCount += dailyCount;
      }

      result[key] = Math.round(totalCount);
    }
  );

  return result;
}

function getScaledTimeMetrics(
  multiplier: number,
  trendFactor: number = 1
): Metrics {
  const countMetrics = getScaledMetrics(multiplier, trendFactor);
  const result = {} as Metrics;

  (Object.entries(baseMetrics15Days) as [MetricKey, BaseMetric][]).forEach(
    ([key, value]) => {
      const prCount = countMetrics[key];
      let totalHours = 0;

      // Calculate time for each PR with realistic variance
      for (let i = 0; i < prCount; i++) {
        const baseTime = getRandomInRange(
          value.timeRange.min,
          value.timeRange.max
        );
        const complexityFactor = value.complexity;

        // Add complexity-based variance
        const timeWithComplexity = baseTime * complexityFactor;

        // Add random variance based on PR size
        const finalTime = addVariance(timeWithComplexity, 0.25);
        totalHours += finalTime;
      }

      // Add trend factor influence
      totalHours = Math.round(totalHours * (1 + 0.05 * trendFactor));
      result[key] = totalHours;
    }
  );

  return result;
}

const formatHours = (hours: number) => {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// Helper function to generate PR status metrics
function getPRStatusMetrics(metrics: Metrics): PRMetrics {
  return Object.entries(metrics).reduce((acc, [key, value]) => {
    // Realistic distribution of PR statuses
    const merged = Math.round(value * 0.7); // 70% merged
    const closed = Math.round(value * 0.2); // 20% closed
    const open = value - merged - closed; // Remaining open

    acc[key] = { merged, closed, open };
    return acc;
  }, {} as PRMetrics);
}

const getSankeyData = (metrics: Metrics, viewType: string) => {
  const prStatusMetrics = getPRStatusMetrics(metrics);
  const formatValue = viewType === "time" ? formatHours : String;

  // Calculate totals for each status
  const totalMerged = Object.values(prStatusMetrics).reduce(
    (sum, status) => sum + status.merged,
    0
  );
  const totalClosed = Object.values(prStatusMetrics).reduce(
    (sum, status) => sum + status.closed,
    0
  );
  const totalOpen = Object.values(prStatusMetrics).reduce(
    (sum, status) => sum + status.open,
    0
  );

  const formatTotal =
    viewType === "time"
      ? `${formatHours(totalMerged + totalClosed + totalOpen)} Total`
      : `${totalMerged + totalClosed + totalOpen} Total PRs`;

  const nodes = [
    { name: formatTotal },
    { name: `Merged (${formatValue(totalMerged)})` },
    { name: `Closed (${formatValue(totalClosed)})` },
    { name: `Open (${formatValue(totalOpen)})` },
    ...Object.entries(prStatusMetrics).map(([key, status]) => ({
      name: `${key} (${formatValue(
        status.merged + status.closed + status.open
      )})`,
    })),
  ].map((node, index) => ({ ...node, id: index }));

  const links = [
    // Links from total to status
    { source: 0, target: 1, value: totalMerged },
    { source: 0, target: 2, value: totalClosed },
    { source: 0, target: 3, value: totalOpen },

    // Links from status to PR types
    ...Object.entries(prStatusMetrics).flatMap(([key, status], index) => [
      { source: 1, target: 4 + index, value: status.merged },
      { source: 2, target: 4 + index, value: status.closed },
      { source: 3, target: 4 + index, value: status.open },
    ]),
  ];

  return { nodes, links };
};

const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload } = props;

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={blueColors[0]}
        fillOpacity={0.8}
        stroke={blueColors[0]}
      />
      <text
        x={x + width + 10}
        y={y + height / 2}
        textAnchor="start"
        dominantBaseline="middle"
        fill="hsl(var(--foreground))"
        fontSize={12}
        fontWeight={500}
      >
        {payload.name}
      </text>
    </Layer>
  );
};

export function WorkDistributionOverviewChart() {
  const [timeRange, setTimeRange] = React.useState("1month");

  const countMetrics = React.useMemo(() => {
    const multiplier =
      timeRange === "15days" ? 1 : timeRange === "1month" ? 2 : 5;
    const trendFactor =
      timeRange === "15days" ? 0 : timeRange === "1month" ? 0.5 : 1;

    // Add weekly patterns
    const isLongerPeriod = timeRange !== "15days";
    const weekendReduction = isLongerPeriod ? 0.7 : 1; // Reduced activity on weekends

    const baseMetrics = getScaledMetrics(multiplier, trendFactor);

    // Apply weekend reduction to final numbers
    return Object.entries(baseMetrics).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: Math.round(value * weekendReduction),
      }),
      {} as Metrics
    );
  }, [timeRange]);

  const timeMetrics = React.useMemo(() => {
    const multiplier =
      timeRange === "15days" ? 1 : timeRange === "1month" ? 2 : 5;
    const trendFactor =
      timeRange === "15days" ? 0 : timeRange === "1month" ? 0.5 : 1;

    // Add weekly patterns
    const isLongerPeriod = timeRange !== "15days";
    const weekendReduction = isLongerPeriod ? 0.7 : 1; // Reduced activity on weekends

    const baseMetrics = getScaledTimeMetrics(multiplier, trendFactor);

    // Apply weekend reduction to final numbers
    return Object.entries(baseMetrics).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: Math.round(value * weekendReduction),
      }),
      {} as Metrics
    );
  }, [timeRange]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            Work Distribution
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm text-green-500">
              <ArrowUp className="h-4 w-4" />
              5.97%
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Distribution of work across different types of pull requests
          </p>
        </div>
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pull Request Count</CardTitle>
            <CardDescription>
              Number of pull requests by type over{" "}
              {timeRangeOptions
                .find((opt) => opt.value === timeRange)
                ?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={getSankeyData(countMetrics, "count")}
                  iterations={64}
                  link={{
                    stroke: blueColors[7],
                    strokeOpacity: 0.2,
                    fill: `url(#linkGradient)`,
                    fillOpacity: 0.2,
                  }}
                  node={CustomNode}
                  margin={{ left: 150, right: 150, top: 40, bottom: 40 }}
                  nodePadding={100}
                  nodeWidth={30}
                >
                  <defs>
                    <linearGradient
                      id="linkGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor={blueColors[7]}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={blueColors[0]}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                </Sankey>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Time Focus</CardTitle>
            <CardDescription>
              Time spent on pull requests by type over{" "}
              {timeRangeOptions
                .find((opt) => opt.value === timeRange)
                ?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={getSankeyData(timeMetrics, "time")}
                  iterations={64}
                  link={{
                    stroke: blueColors[7],
                    strokeOpacity: 0.2,
                    fill: `url(#linkGradient)`,
                    fillOpacity: 0.2,
                  }}
                  node={CustomNode}
                  margin={{ left: 150, right: 150, top: 40, bottom: 40 }}
                  nodePadding={100}
                  nodeWidth={30}
                >
                  <defs>
                    <linearGradient
                      id="linkGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor={blueColors[7]}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={blueColors[0]}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                </Sankey>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
