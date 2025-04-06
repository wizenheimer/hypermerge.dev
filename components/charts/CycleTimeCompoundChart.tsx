"use client";

import * as React from "react";
// import { Calendar, Check, LineChart } from "lucide-react";

// import { cn } from "@/lib/utils"; // Removed unused import
import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MetricCardGrid, MetricCardData } from "@/components/menu-card-grid";
import { GenericChart } from "@/components/generic-chart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";
import { generateCycleTimeData } from "@/data/dataGenerators";

// --- Configuration ---
interface MetricConfig {
  label: string;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    codingTime: { label: "Coding Time" },
    pickupTime: { label: "Pickup Time" },
    reviewTime: { label: "Review Time" },
    mergeTime: { label: "Merge Time" },
  },
};

const cardConfigs = chartConfigs.metrics; // Cards show the same metrics as the chart

const defaultSelectedMetrics = Object.keys(chartConfigs.metrics);
const defaultSelectedCards = Object.keys(cardConfigs);

const timeRangeLabels: Record<TimeRange, string> = {
  "1week": "1 Week",
  "15days": "15 Days",
  "1month": "1 Month",
  "3month": "3 Months",
  "6month": "6 Months",
  "1year": "1 Year",
};

interface CycleTimeData {
  date: Date;
  week: string;
  tooltipLabel: string; // Might be used by tooltip formatter if customized
  codingTime: number;
  pickupTime: number;
  reviewTime: number;
  mergeTime: number;
  [key: string]: any; // Re-added: Needed for dynamic access in helper functions
}

// Mock data generator (keep specific logic here)
// const generateCycleTimeData = (): CycleTimeData[] => {
//   const today = new Date();
//   const data = [];
//   for (let i = 51; i >= 0; i--) {
//     const date = new Date(today);
//     date.setDate(today.getDate() - i * 7);
//     const weekNumber = Math.floor(1 + i); // Simple week number
//     const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
//     const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;
//     data.push({
//       date,
//       week: weekKey,
//       tooltipLabel,
//       codingTime: Math.random() * 5 + 2, // 2-7 hours
//       pickupTime: Math.random() * 8 + 4, // 4-12 hours
//       reviewTime: Math.random() * 10 + 6, // 6-16 hours
//       mergeTime: Math.random() * 2 + 0.1, // 0.1-2.1 hours
//     });
//   }
//   return data;
// };

// --- Component ---
export function CycleTimeCompoundChart() {
  // Original Data State
  const [cycleTimeData, setCycleTimeData] = React.useState<CycleTimeData[]>([]);

  // Fetch original data
  React.useEffect(() => {
    setCycleTimeData(generateCycleTimeData());
  }, []);

  // State for selected metrics and time range
  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<CycleTimeData>({ data: cycleTimeData });
  const [selectedChartMetrics, setSelectedChartMetrics] = React.useState(
    defaultSelectedMetrics,
  );
  const [selectedCardMetrics, setSelectedCardMetrics] =
    React.useState(defaultSelectedCards);

  // --- Derived State & Calculations ---
  const currentChartConfig = chartConfigs.metrics;
  const currentCardConfig = cardConfigs;

  // Calculate metric values (use latest point in filtered time range)
  const getMetricValue = (key: string): number => {
    if (filteredData.length === 0) return 0;
    const latestData = filteredData[filteredData.length - 1];
    return latestData[key as keyof CycleTimeData] || 0;
  };

  // Calculate change percentage (compared to previous point)
  const getChangePercentage = (key: string): number => {
    if (filteredData.length < 2) return 0;
    const currentValue =
      filteredData[filteredData.length - 1][key as keyof CycleTimeData] || 0;
    const previousValue =
      filteredData[filteredData.length - 2][key as keyof CycleTimeData] || 0;
    if (previousValue === 0) return currentValue === 0 ? 0 : Infinity; // Avoid division by zero
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Determine positive/negative change type (lower is better for time metrics)
  const getChangeType = (change: number): MetricCardData["changeType"] => {
    return change > 0 ? "negative" : change < 0 ? "positive" : "neutral";
  };

  // Prepare data for Metric Cards
  const metricCards: MetricCardData[] = React.useMemo(
    () =>
      Object.entries(currentCardConfig)
        .filter(([key]) => selectedCardMetrics.includes(key))
        .map(([key, config]) => {
          const value = getMetricValue(key);
          const change = getChangePercentage(key);
          return {
            key,
            title: config.label,
            value: Number(value.toFixed(1)), // Format to one decimal place
            change: Number(change.toFixed(1)), // Format to one decimal place
            changeType: getChangeType(change),
          };
        }),
    [
      currentCardConfig,
      selectedCardMetrics,
      filteredData,
      getMetricValue, // Added dependency
      getChangePercentage, // Added dependency
      getChangeType, // Added dependency
    ],
  );

  // --- Event Handlers ---
  const toggleChartMetric = (metric: string) => {
    setSelectedChartMetrics((prev) => {
      if (prev.length === 1 && prev.includes(metric)) return prev; // Prevent unselecting last metric
      return prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric];
    });
  };

  // --- Loading State ---
  if (cycleTimeData.length === 0) {
    return <div data-oid="tg_cgg1">Loading cycle time data...</div>;
  }

  // --- Menu Configuration ---
  const menuContent = (
    <Menu
      // No viewType needed for this dashboard
      currentConfig={currentChartConfig}
      currentSelectedMetrics={selectedChartMetrics}
      toggleMetric={toggleChartMetric}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      timeRangeLabels={timeRangeLabels}
      cardConfigs={currentCardConfig}
      selectedCards={selectedCardMetrics}
      setSelectedCards={setSelectedCardMetrics}
      showChartMetricSelector={true}
      showCardSelector={true}
      showTimeRangeSelector={true}
      data-oid="bhhgily"
    />
  );

  // --- Render ---
  return (
    <DashboardLayout
      title="Cycle Time"
      description="Track time for code changes through different stages"
      menuContent={menuContent}
      // No pagination needed
      data-oid="0qqa1tk"
    >
      <MetricCardGrid
        metrics={metricCards}
        gridClasses="grid-cols-1 md:grid-cols-2 lg:grid-cols-4" // Fixed grid for 4 cards
        className="mb-6"
        data-oid="lt:2gy1"
      />

      <GenericChart
        chartType="area" // Area chart for cycle time trends
        data={filteredData}
        metrics={selectedChartMetrics}
        config={currentChartConfig}
        dataKeyX="week"
        data-oid="l1moag3"
      />
    </DashboardLayout>
  );
}
