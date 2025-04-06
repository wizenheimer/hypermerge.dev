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
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadialBarChart,
  PolarRadiusAxis,
  RadialBar,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { blueColors } from "@/lib/colors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  totalValue: number;
  currentValue: number;
}

function MetricCard({
  title,
  value,
  change,
  totalValue,
  currentValue,
}: MetricCardProps) {
  const getChangeIcon = () => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <ArrowRight className="h-4 w-4 text-orange-500" />;
  };

  const chartData = [
    {
      type: title,
      count: value,
      total: 50, // Using a fixed total for better visualization
    },
  ];

  const metricConfig = {
    count: {
      label: "Count",
      color: blueColors[0],
    },
    total: {
      label: "Total",
      color: blueColors[7],
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">
          Pull Requests focussed on {title.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={metricConfig}
          className="mx-auto aspect-square w-full max-w-[180px]"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={50}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
          >
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 12}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {value}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 8}
                          className="fill-muted-foreground text-xs"
                        >
                          Count
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              name="Count"
              dataKey="count"
              stackId="a"
              cornerRadius={5}
              fill={blueColors[0]}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              name="Total"
              dataKey="total"
              stackId="a"
              cornerRadius={5}
              fill={blueColors[7]}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 pt-2 text-xs">
        <div className="flex items-center gap-1 font-medium leading-none">
          Change {getChangeIcon()}
          <span
            className={
              change > 0
                ? "text-green-500"
                : change < 0
                ? "text-red-500"
                : "text-orange-500"
            }
          >
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
        <div className="leading-none text-muted-foreground">
          {((value / totalValue) * 100).toFixed(1)}% of total PRs
        </div>
      </CardFooter>
    </Card>
  );
}

const timeRangeOptions = [
  { label: "15 Days", value: "15days" },
  { label: "1 Month", value: "1month" },
  { label: "3 Months", value: "3month" },
];

// Base metrics for 15 days (realistic daily PR volumes for a medium-sized team)
const baseMetrics15Days = {
  Features: 12, // ~0.8 feature PRs per day
  Bugs: 18, // ~1.2 bug fixes per day
  Chore: 9, // ~0.6 chores per day
  Documentation: 6, // ~0.4 docs per day
  Enhancement: 8, // ~0.5 enhancements per day
  Security: 3, // ~0.2 security fixes per day
};

// Helper function for scaled metrics (used by both generators)
function getScaledMetrics(multiplier: number, trendFactor: number = 1) {
  return {
    Features: Math.round(
      baseMetrics15Days.Features * multiplier * (1 + 0.2 * trendFactor)
    ),
    Bugs: Math.round(
      baseMetrics15Days.Bugs * multiplier * (1 - 0.1 * trendFactor)
    ),
    Chore: Math.round(baseMetrics15Days.Chore * multiplier),
    Documentation: Math.round(
      baseMetrics15Days.Documentation * multiplier * (1 + 0.1 * trendFactor)
    ),
    Enhancement: Math.round(
      baseMetrics15Days.Enhancement * multiplier * (1 + 0.15 * trendFactor)
    ),
    Security: Math.round(
      baseMetrics15Days.Security * multiplier * (1 + 0.05 * trendFactor)
    ),
  };
}

const getMetricsForTimeRange = (range: string) => {
  const baseMetrics =
    {
      "15days": getScaledMetrics(1, 0), // Base period
      "1month": getScaledMetrics(2, 0.5), // ~2x with slight trends
      "3month": getScaledMetrics(5, 1), // ~5x with stronger trends
    }[range] || getScaledMetrics(2, 0.5); // Default to 1 month

  // Calculate the total PRs for this period
  const totalPRs = Object.values(baseMetrics).reduce(
    (sum, count) => sum + count,
    0
  );

  // Calculate realistic change percentages based on previous period
  const getChangePercentage = (
    current: number,
    metric: keyof typeof baseMetrics15Days
  ) => {
    const previousPeriod =
      range === "15days"
        ? baseMetrics15Days[metric] * 0.9 // Simulate previous 15 days
        : range === "1month"
        ? getScaledMetrics(1, 0)[metric] // Compare with 15 days
        : getScaledMetrics(2, 0.5)[metric]; // Compare with 1 month

    return ((current - previousPeriod) / previousPeriod) * 100;
  };

  return [
    {
      title: "Features",
      value: baseMetrics.Features,
      change: getChangePercentage(baseMetrics.Features, "Features"),
      totalValue: totalPRs,
      currentValue: baseMetrics.Features,
    },
    {
      title: "Bugs",
      value: baseMetrics.Bugs,
      change: getChangePercentage(baseMetrics.Bugs, "Bugs"),
      totalValue: totalPRs,
      currentValue: baseMetrics.Bugs,
    },
    {
      title: "Chore",
      value: baseMetrics.Chore,
      change: getChangePercentage(baseMetrics.Chore, "Chore"),
      totalValue: totalPRs,
      currentValue: baseMetrics.Chore,
    },
    {
      title: "Documentation",
      value: baseMetrics.Documentation,
      change: getChangePercentage(baseMetrics.Documentation, "Documentation"),
      totalValue: totalPRs,
      currentValue: baseMetrics.Documentation,
    },
    {
      title: "Enhancement",
      value: baseMetrics.Enhancement,
      change: getChangePercentage(baseMetrics.Enhancement, "Enhancement"),
      totalValue: totalPRs,
      currentValue: baseMetrics.Enhancement,
    },
    {
      title: "Security",
      value: baseMetrics.Security,
      change: getChangePercentage(baseMetrics.Security, "Security"),
      totalValue: totalPRs,
      currentValue: baseMetrics.Security,
    },
  ];
};

const getRadarDataForTimeRange = (range: string) => {
  const metrics =
    {
      "15days": getScaledMetrics(1, 0),
      "1month": getScaledMetrics(2, 0.5),
      "3month": getScaledMetrics(5, 1),
    }[range] || getScaledMetrics(2, 0.5);

  // Calculate total PRs for this period
  const totalPRs = Object.values(metrics).reduce(
    (sum, count) => sum + count,
    0
  );

  // Return the same categories as the metric cards
  return [
    { type: "Features", count: metrics.Features, total: totalPRs },
    { type: "Bugs", count: metrics.Bugs, total: totalPRs },
    { type: "Chore", count: metrics.Chore, total: totalPRs },
    { type: "Documentation", count: metrics.Documentation, total: totalPRs },
    { type: "Enhancement", count: metrics.Enhancement, total: totalPRs },
    { type: "Security", count: metrics.Security, total: totalPRs },
  ];
};

const chartConfig = {
  count: {
    label: "Count",
    color: blueColors[0],
  },
  total: {
    label: "Total",
    color: blueColors[7],
  },
} satisfies ChartConfig;

export function WorkDistributionOverviewChart() {
  const [timeRange, setTimeRange] = React.useState("1month");
  const [currentPage, setCurrentPage] = React.useState(0);
  const cardsPerPage = 4;
  const allMetrics = getMetricsForTimeRange(timeRange);
  const maxPages = Math.ceil(allMetrics.length / cardsPerPage);
  const radarData = getRadarDataForTimeRange(timeRange);

  // Get current page's metrics
  const getCurrentMetrics = () => {
    const start = currentPage * cardsPerPage;
    return allMetrics.slice(start, start + cardsPerPage);
  };

  return (
    <div className="flex flex-col">
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(maxPages - 1, p + 1))}
            disabled={currentPage === maxPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/metrics">View More</Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle>Pull Request Distribution</CardTitle>
            <CardDescription>
              Distribution of pull requests by type over{" "}
              {timeRangeOptions
                .find((opt) => opt.value === timeRange)
                ?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-[4/3] w-full"
            >
              <RadarChart
                data={radarData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={false}
                />
                <PolarGrid stroke={blueColors[7]} strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="type"
                  tick={{
                    fill: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                />
                <Radar
                  name="Count"
                  dataKey="count"
                  stroke={blueColors[0]}
                  fill={blueColors[0]}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Total"
                  dataKey="total"
                  stroke={blueColors[7]}
                  fill={blueColors[7]}
                  fillOpacity={0.4}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid h-full grid-cols-2 content-start gap-4">
          {getCurrentMetrics().map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
