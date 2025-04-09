"use client";

import * as React from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { blueColors } from "@/lib/colors";
import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";
import { useRouter } from "next/navigation";

interface PRCalendarChartProps {
  showViewMore?: boolean;
}

interface CalendarData {
  day: string;
  value: number;
  details: {
    merged: number;
    closed: number;
    open: number;
    byFocus: {
      [key: string]: number;
    };
  };
}

interface PRStatus {
  merged: number;
  closed: number;
  open: number;
}

interface PRMetrics {
  [key: string]: PRStatus;
}

interface MetricConfig {
  label: string;
  description: string;
}

const viewTypeLabels = {
  focus: "By Focus",
  status: "By Status",
};

const timeRangeLabels: Record<TimeRange, string> = {
  "1week": "1 Week",
  "15days": "15 Days",
  "1month": "1 Month",
  "3month": "3 Months",
  "6month": "6 Months",
  "1year": "1 Year",
};

const chartConfigs = {
  status: {
    merged: {
      label: "Merged",
      description: "Total number of merged pull requests",
    },
    closed: {
      label: "Closed",
      description: "Total number of closed pull requests",
    },
    open: {
      label: "Open",
      description: "Total number of open pull requests",
    },
  },
  focus: {
    features: {
      label: "Features",
      description: "Feature-related pull requests",
    },
    bugs: {
      label: "Bugs",
      description: "Bug fix pull requests",
    },
    chore: {
      label: "Chores",
      description: "Maintenance and chore pull requests",
    },
    documentation: {
      label: "Documentation",
      description: "Documentation updates",
    },
    enhancement: {
      label: "Enhancements",
      description: "Enhancement pull requests",
    },
    security: {
      label: "Security",
      description: "Security-related pull requests",
    },
  },
};

// Custom tooltip component
interface TooltipData {
  day: string;
  value: number;
  data: CalendarData;
}

const CustomTooltip = ({
  day,
  value,
  data,
  viewType,
}: TooltipData & { viewType: keyof typeof viewTypeLabels }) => {
  const details = data.details;
  const items =
    viewType === "status"
      ? [
          { label: "Merged", value: details.merged },
          { label: "Closed", value: details.closed },
          { label: "Open", value: details.open },
        ]
      : Object.entries(details.byFocus).map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value,
        }));

  return (
    <div
      className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
      data-oid="59c6m4a"
    >
      <div className="flex flex-col space-y-1.5" data-oid="f.-v.:_">
        <h3
          className="text-sm font-semibold leading-none tracking-tight"
          data-oid="dxg2kyw"
        >
          {new Date(day).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>
        <div className="space-y-1" data-oid="h0.pjc.">
          <div className="text-sm text-muted-foreground" data-oid="lz2n12:">
            Total PRs: {value}
          </div>
          <div className="mt-2 space-y-1" data-oid="ki1tbu2">
            {items.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
                data-oid=":pshd-0"
              >
                <span className="text-muted-foreground" data-oid="wx.cj4a">
                  {label}
                </span>
                <span className="font-medium" data-oid="dugsvld">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate random calendar data
function generateCalendarData(
  from: Date,
  to: Date,
  metrics: PRMetrics,
  viewType: keyof typeof viewTypeLabels,
): CalendarData[] {
  const data: CalendarData[] = [];
  const currentDate = new Date(from);

  while (currentDate <= to) {
    const day = currentDate.toISOString().split("T")[0];
    let value = 0;
    const details = {
      merged: 0,
      closed: 0,
      open: 0,
      byFocus: {} as { [key: string]: number },
    };

    // Sum all PRs for the day
    Object.entries(metrics).forEach(([type, status]) => {
      details.merged += status.merged;
      details.closed += status.closed;
      details.open += status.open;
      details.byFocus[type] = status.merged + status.closed + status.open;
      value += status.merged + status.closed + status.open;
    });

    // Add some randomness to make it more realistic
    const randomFactor = 0.8 + Math.random() * 0.4;
    value = Math.round(value * randomFactor);
    details.merged = Math.round(details.merged * randomFactor);
    details.closed = Math.round(details.closed * randomFactor);
    details.open = Math.round(details.open * randomFactor);
    Object.keys(details.byFocus).forEach(
      (key) =>
        (details.byFocus[key] = Math.round(
          details.byFocus[key] * randomFactor,
        )),
    );

    data.push({ day, value, details });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

export function PRCalendarChart({ showViewMore }: PRCalendarChartProps) {
  const router = useRouter();
  const [viewType, setViewType] =
    React.useState<keyof typeof viewTypeLabels>("focus");
  const [timeRange, setTimeRange] = React.useState<TimeRange>("1year");
  const [metrics, setMetrics] = React.useState<PRMetrics>({});
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

  // Generate sample metrics (you would replace this with real data)
  React.useEffect(() => {
    const sampleMetrics: PRMetrics = {
      features: { merged: 15, closed: 3, open: 5 },
      bugs: { merged: 20, closed: 2, open: 3 },
      chore: { merged: 10, closed: 1, open: 2 },
      documentation: { merged: 8, closed: 1, open: 1 },
      enhancement: { merged: 12, closed: 2, open: 4 },
      security: { merged: 5, closed: 1, open: 1 },
    };
    setMetrics(sampleMetrics);
  }, []);

  // Calculate date range based on timeRange
  const to = new Date();
  const from = new Date();
  switch (timeRange) {
    case "1week":
      from.setDate(from.getDate() - 7);
      break;
    case "15days":
      from.setDate(from.getDate() - 15);
      break;
    case "1month":
      from.setMonth(from.getMonth() - 1);
      break;
    case "3month":
      from.setMonth(from.getMonth() - 3);
      break;
    case "6month":
      from.setMonth(from.getMonth() - 6);
      break;
    case "1year":
      from.setFullYear(from.getFullYear() - 1);
      break;
  }

  const calendarData = generateCalendarData(from, to, metrics, viewType);

  // --- Menu Configuration ---
  const menuContent = (
    <Menu
      viewType={viewType}
      setViewType={(newViewType) =>
        setViewType(newViewType as keyof typeof viewTypeLabels)
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
      title="Daily PR Activity"
      description={
        viewType === "focus"
          ? "Track pull requests by focus area"
          : "Track pull requests by status"
      }
      menuContent={menuContent}
      viewMore={
        showViewMore
          ? {
              label: "View Details",
              onClick: () => router.push("/metrics"),
            }
          : undefined
      }
      data-oid="d_6:v.w"
    >
      <div className="h-[500px] w-full" data-oid=":50n1zt">
        <ResponsiveCalendar
          data={calendarData}
          from={from.toISOString().split("T")[0]}
          to={to.toISOString().split("T")[0]}
          emptyColor="#eeeeee"
          colors={blueColors}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          onClick={(day) => setSelectedDay(day.day)}
          tooltip={({ day }) => {
            const dayData = calendarData.find((d) => d.day === day);
            if (!dayData) return null;
            return (
              <CustomTooltip
                day={day}
                value={dayData.value}
                data={dayData}
                viewType={viewType}
                data-oid="nmzw35t"
              />
            );
          }}
          data-oid="9f0tf0q"
        />
      </div>
    </DashboardLayout>
  );
}
