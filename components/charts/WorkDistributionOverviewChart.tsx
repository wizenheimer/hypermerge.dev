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
import { ResponsiveSankey } from "@nivo/sankey";
import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

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
    { id: "total", name: formatTotal },
    { id: "merged", name: `Merged (${formatValue(totalMerged)})` },
    { id: "closed", name: `Closed (${formatValue(totalClosed)})` },
    { id: "open", name: `Open (${formatValue(totalOpen)})` },
    ...Object.entries(prStatusMetrics).map(([key, status]) => ({
      id: key.toLowerCase(),
      name: `${key} (${formatValue(
        status.merged + status.closed + status.open
      )})`,
    })),
  ];

  const links = [
    // Links from total to status
    { source: "total", target: "merged", value: totalMerged },
    { source: "total", target: "closed", value: totalClosed },
    { source: "total", target: "open", value: totalOpen },

    // Links from status to PR types
    ...Object.entries(prStatusMetrics).flatMap(([key, status]) => [
      { source: "merged", target: key.toLowerCase(), value: status.merged },
      { source: "closed", target: key.toLowerCase(), value: status.closed },
      { source: "open", target: key.toLowerCase(), value: status.open },
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

const CustomNodeTooltip = ({ node }: { node: any }) => {
  if (!node) return null;

  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-sm font-semibold leading-none tracking-tight">
          {node.name}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span className="font-medium">{node.value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomLinkTooltip = ({ link }: { link: any }) => {
  if (!link) return null;

  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-sm font-semibold leading-none tracking-tight">
          {link.source.name} → {link.target.name}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span className="font-medium">{link.value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const viewTypeLabels = {
  count: "PR Count",
  time: "Time Focus",
};

const timeRangeLabels: Record<TimeRange, string> = {
  "1week": "1 Week",
  "15days": "15 Days",
  "1month": "1 Month",
  "3month": "3 Months",
  "6month": "6 Months",
  "1year": "1 Year",
};

export function WorkDistributionOverviewChart() {
  const [viewType, setViewType] = React.useState<"count" | "time">("count");
  const [timeRange, setTimeRange] = React.useState<TimeRange>("1month");
  const [metrics, setMetrics] = React.useState<PRMetrics>({});

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

  const currentMetrics = viewType === "count" ? countMetrics : timeMetrics;

  // --- Menu Configuration ---
  const menuContent = (
    <Menu
      viewType={viewType}
      setViewType={(newViewType) =>
        setViewType(newViewType as "count" | "time")
      }
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      viewTypeLabels={viewTypeLabels}
      timeRangeLabels={timeRangeLabels}
      showViewTypeSelector={true}
      showTimeRangeSelector={true}
      data-oid="beyk3q8"
    />
  );

  return (
    <DashboardLayout
      title="Work Distribution Overview"
      description={
        viewType === "count"
          ? "Number of pull requests by type"
          : "Time spent on pull requests by type"
      }
      menuContent={menuContent}
      data-oid="d_6:v.w"
    >
      <div className="h-[500px] w-full">
        <ResponsiveSankey
          data={getSankeyData(currentMetrics, viewType)}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          colors={blueColors}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={18}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderColor={{
            from: "color",
            modifiers: [["darker", 0.8]],
          }}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="inside"
          labelOrientation="horizontal"
          labelPadding={16}
          labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
          nodeTooltip={CustomNodeTooltip}
          linkTooltip={CustomLinkTooltip}
        />
      </div>
    </DashboardLayout>
  );
}
