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
    if (change > 0)
      return <ArrowUp className="h-4 w-4 text-green-500" data-oid="cebgc8h" />;
    if (change < 0)
      return <ArrowDown className="h-4 w-4 text-red-500" data-oid="8stvzff" />;
    return (
      <ArrowRight className="h-4 w-4 text-orange-500" data-oid="t02yynq" />
    );
  };

  // Calculate the remaining value for stacking
  const remaining = totalValue - value;

  const chartData = [
    {
      name: title,
      count: value,
      remaining: remaining,
    },
  ];

  const metricConfig = {
    count: {
      label: title,
      color: blueColors[0],
    },
    remaining: {
      label: "Others",
      color: blueColors[7],
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col" data-oid="4gt5zpm">
      <CardHeader className="items-center space-y-0 pb-0" data-oid="8g2_zlf">
        <CardTitle className="text-sm font-medium" data-oid="gblrynf">
          {title}
        </CardTitle>
        <CardDescription className="text-xs" data-oid="_h01qi6">
          Pull Requests focussed on {title.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent
        className="flex flex-1 items-center justify-center p-0"
        data-oid="2fpqcqz"
      >
        <ChartContainer
          config={metricConfig}
          className="mx-auto aspect-square w-full max-w-[200px]"
          data-oid="_ultwm5"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={60}
            outerRadius={100}
            startAngle={180}
            endAngle={0}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            data-oid="2v_1:xt"
          >
            <ChartTooltip
              content={
                <ChartTooltipContent indicator="line" data-oid="tu1w.:7" />
              }
              cursor={false}
              data-oid="kipqw0n"
            />

            <PolarRadiusAxis
              tick={false}
              tickLine={false}
              axisLine={false}
              data-oid="7c3kw8b"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        data-oid="wzimtbr"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 12}
                          className="fill-foreground text-2xl font-bold"
                          data-oid="vhp8q5o"
                        >
                          {value}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 8}
                          className="fill-muted-foreground text-xs"
                          data-oid="b:3pbq6"
                        >
                          {title}
                        </tspan>
                      </text>
                    );
                  }
                }}
                data-oid="ql7fbz."
              />
            </PolarRadiusAxis>
            <RadialBar
              name={title}
              dataKey="count"
              stackId="a"
              cornerRadius={5}
              fill={blueColors[0]}
              className="stroke-transparent stroke-2"
              maxBarSize={25}
              data-oid="u8h4wkw"
            />

            <RadialBar
              name="Others"
              dataKey="remaining"
              stackId="a"
              cornerRadius={5}
              fill={blueColors[7]}
              fillOpacity={0.4}
              className="stroke-transparent stroke-2"
              maxBarSize={25}
              data-oid="8-blbhq"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter
        className="flex items-center justify-between gap-2 pt-2"
        data-oid="coy4n_b"
      >
        <div className="text-xs text-muted-foreground" data-oid="v6w9mkn">
          {((value / totalValue) * 100).toFixed(1)}% of total PRs
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            change > 0
              ? "bg-green-50 text-green-500"
              : change < 0
                ? "bg-red-50 text-red-500"
                : "bg-orange-50 text-orange-500"
          }`}
          data-oid="b2.ap.r"
        >
          {getChangeIcon()}
          {Math.abs(change).toFixed(1)}%
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
      baseMetrics15Days.Features * multiplier * (1 + 0.2 * trendFactor),
    ),
    Bugs: Math.round(
      baseMetrics15Days.Bugs * multiplier * (1 - 0.1 * trendFactor),
    ),
    Chore: Math.round(baseMetrics15Days.Chore * multiplier),
    Documentation: Math.round(
      baseMetrics15Days.Documentation * multiplier * (1 + 0.1 * trendFactor),
    ),
    Enhancement: Math.round(
      baseMetrics15Days.Enhancement * multiplier * (1 + 0.15 * trendFactor),
    ),
    Security: Math.round(
      baseMetrics15Days.Security * multiplier * (1 + 0.05 * trendFactor),
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
    0,
  );

  // Calculate realistic change percentages based on previous period
  const getChangePercentage = (
    current: number,
    metric: keyof typeof baseMetrics15Days,
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
    0,
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
    <div className="flex flex-col" data-oid="s1znzcc">
      <div className="flex items-center justify-between" data-oid="hnj8hk-">
        <div data-oid="rt0m0j5">
          <h2
            className="flex items-center gap-2 text-2xl font-semibold"
            data-oid="hj0dog3"
          >
            Work Distribution
            <span
              className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm text-green-500"
              data-oid="7wztk6a"
            >
              <ArrowUp className="h-4 w-4" data-oid="w9x:p6c" />
              5.97%
            </span>
          </h2>
          <p className="text-sm text-muted-foreground" data-oid="q87is3p">
            Neque porro quisquam est qui dolorem ipsum quia
          </p>
        </div>
        <div className="flex items-center gap-2" data-oid="ek9rzte">
          <DropdownMenu data-oid="5y7s9.1">
            <DropdownMenuTrigger asChild data-oid="s_k_y:9">
              <Button variant="outline" size="sm" data-oid="wtgfivk">
                {timeRangeOptions.find((opt) => opt.value === timeRange)?.label}
                <ChevronDown className="ml-2 h-4 w-4" data-oid="mfojep6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-oid="2q8yoq0">
              {timeRangeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  data-oid="q0di1g6"
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
            data-oid="dosk481"
          >
            <ChevronLeft className="h-4 w-4" data-oid="mkt1ie-" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(maxPages - 1, p + 1))}
            disabled={currentPage === maxPages - 1}
            data-oid="xbp310o"
          >
            <ChevronRight className="h-4 w-4" data-oid="g3uv87d" />
          </Button>
          <Button variant="outline" size="sm" asChild data-oid="nm6wvg:">
            <Link href="/metrics" data-oid="764_s:8">
              View More
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2" data-oid="inx8d3i">
        <Card className="h-full" data-oid="ulvu7xx">
          <CardHeader className="pb-0" data-oid="j9q1xb6">
            <CardTitle data-oid="vxoqmc_">Pull Request Distribution</CardTitle>
            <CardDescription data-oid="l2zn-21">
              Distribution of pull requests by type over{" "}
              {timeRangeOptions
                .find((opt) => opt.value === timeRange)
                ?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2" data-oid="jw7rhtw">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-[4/3] w-full"
              data-oid="7tu8a5k"
            >
              <RadarChart
                data={radarData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
                data-oid="8o8u32c"
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent indicator="line" data-oid="8y6p99p" />
                  }
                  cursor={false}
                  data-oid="136_bh3"
                />

                <PolarGrid
                  stroke={blueColors[7]}
                  strokeDasharray="3 3"
                  data-oid="89edcxj"
                />

                <PolarAngleAxis
                  dataKey="type"
                  tick={{
                    fill: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                  data-oid="tlotk4-"
                />

                <Radar
                  name="Count"
                  dataKey="count"
                  stroke={blueColors[0]}
                  fill={blueColors[0]}
                  fillOpacity={0.6}
                  data-oid="hd-fmiq"
                />

                <Radar
                  name="Total"
                  dataKey="total"
                  stroke={blueColors[7]}
                  fill={blueColors[7]}
                  fillOpacity={0.4}
                  data-oid="3pkr8iy"
                />

                <ChartLegend
                  content={<ChartLegendContent data-oid="6nc-gwi" />}
                  data-oid="ez5b0kv"
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div
          className="grid h-full grid-cols-2 content-start gap-4"
          data-oid="n1el1-5"
        >
          {getCurrentMetrics().map((metric) => (
            <MetricCard key={metric.title} {...metric} data-oid="c6rn8.0" />
          ))}
        </div>
      </div>
    </div>
  );
}
