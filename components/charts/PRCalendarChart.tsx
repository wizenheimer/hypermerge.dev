"use client";

import * as React from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { blueColors } from "@/lib/colors";

interface CalendarData {
  day: string;
  value: number;
  details: {
    merged: number;
    closed: number;
    open: number;
    byType: {
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

const viewOptions = [
  { label: "All PRs", value: "all" },
  { label: "Features", value: "features" },
  { label: "Bugs", value: "bugs" },
  { label: "Chore", value: "chore" },
  { label: "Documentation", value: "documentation" },
  { label: "Enhancement", value: "enhancement" },
  { label: "Security", value: "security" },
];

const displayOptions = [
  { label: "By Status", value: "status" },
  { label: "By Type", value: "type" },
];

// Helper function to generate random calendar data
function generateCalendarData(
  from: Date,
  to: Date,
  metrics: PRMetrics,
  viewType: string
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
      byType: {} as { [key: string]: number },
    };

    if (viewType === "all") {
      // Sum all PRs for the day
      Object.entries(metrics).forEach(([type, status]) => {
        details.merged += status.merged;
        details.closed += status.closed;
        details.open += status.open;
        details.byType[type] = status.merged + status.closed + status.open;
        value += status.merged + status.closed + status.open;
      });
    } else {
      // Get specific PR type
      const prType = metrics[viewType];
      if (prType) {
        details.merged = prType.merged;
        details.closed = prType.closed;
        details.open = prType.open;
        details.byType[viewType] = prType.merged + prType.closed + prType.open;
        value = prType.merged + prType.closed + prType.open;
      }
    }

    // Add some randomness to make it more realistic
    const randomFactor = 0.8 + Math.random() * 0.4;
    value = Math.round(value * randomFactor);
    details.merged = Math.round(details.merged * randomFactor);
    details.closed = Math.round(details.closed * randomFactor);
    details.open = Math.round(details.open * randomFactor);
    Object.keys(details.byType).forEach(
      (key) =>
        (details.byType[key] = Math.round(details.byType[key] * randomFactor))
    );

    data.push({ day, value, details });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

export function PRCalendarChart() {
  const [viewType, setViewType] = React.useState("all");
  const [displayType, setDisplayType] = React.useState("status");
  const [metrics, setMetrics] = React.useState<PRMetrics>({});

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

  // Calculate date range (last 3 months)
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);

  const calendarData = generateCalendarData(from, to, metrics, viewType);

  const renderTooltip = ({ day, value, details }: CalendarData) => {
    if (displayType === "status") {
      return (
        <div className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5">
            <h3 className="text-sm font-semibold leading-none tracking-tight">
              {day}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Merged</span>
                <span className="font-medium">{details.merged}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Closed</span>
                <span className="font-medium">{details.closed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Open</span>
                <span className="font-medium">{details.open}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-1 text-sm font-medium">
                <span>Total</span>
                <span>{value}</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5">
            <h3 className="text-sm font-semibold leading-none tracking-tight">
              {day}
            </h3>
            <div className="space-y-1">
              {Object.entries(details.byType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground capitalize">
                    {type}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-1 text-sm font-medium">
                <span>Total</span>
                <span>{value}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily PR Activity</CardTitle>
            <CardDescription>
              Track pull request activity over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {
                    displayOptions.find((opt) => opt.value === displayType)
                      ?.label
                  }
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {displayOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setDisplayType(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewOptions.find((opt) => opt.value === viewType)?.label}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {viewOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setViewType(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
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
            legends={[
              {
                anchor: "bottom-right",
                direction: "row",
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: "right-to-left",
              },
            ]}
            tooltip={({ data }) => renderTooltip(data as CalendarData)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
