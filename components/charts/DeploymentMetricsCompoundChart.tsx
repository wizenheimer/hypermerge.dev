"use client";

import * as React from "react";
// import { BarChart3, Calendar, Check, LineChart } from "lucide-react";
import { subDays, subMonths } from "date-fns";

import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MetricCardGrid, MetricCardData } from "@/components/menu-card-grid";
import { GenericChart } from "@/components/generic-chart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";
import {
  generateDeploymentCountData,
  generateDeploymentFocusData,
} from "@/data/dataGenerators";
import { getColorFromPalette } from "@/lib/colors";

// TODO: Define specific types for Deployment data instead of any[] based on dataGenerators.ts
interface DeploymentDataEntry {
  date: string; // Assuming ISO string date based on original code
  week: string;
  // Fields from generateDeploymentCountData
  deployments?: number;
  failures?: number;
  cfr?: number; // Change Failure Rate
  mtr?: number; // Mean Time to Recovery
  // Calculated field
  successful?: number;
  // Allow other fields potentially from focusData (less type safe but needed for common hook)
  [key: string]: any; // Needed for dynamic access
}

// --- Configuration ---
interface MetricConfig {
  label: string;
  color?: string;
}
interface ChartConfigs {
  count: { [key: string]: MetricConfig };
  focus: { [key: string]: MetricConfig };
}

const chartConfigs: ChartConfigs = {
  count: {
    successful: { label: "Successful", color: getColorFromPalette(1) }, // Second blue
    failures: { label: "Failures", color: getColorFromPalette(3) }, // Fourth blue
  },
  focus: {
    features: { label: "Features", color: getColorFromPalette(0) }, // First blue
    security: { label: "Security", color: getColorFromPalette(2) }, // Third blue
    chores: { label: "Chores", color: getColorFromPalette(4) }, // Fifth blue
    documentation: { label: "Documentation", color: getColorFromPalette(6) }, // Seventh blue
    bugfixes: { label: "Bugfixes", color: getColorFromPalette(8) }, // Last blue
  },
};

// Card configs are separate for this dashboard
const cardConfigs: { [key: string]: MetricConfig } = {
  deployments: { label: "Deployments" },
  failures: { label: "Failures" },
  cfr: { label: "Change Failure Rate" },
  mtr: { label: "Mean Time to Recovery" },
};

const defaultSelectedChartMetrics = {
  count: Object.keys(chartConfigs.count),
  focus: Object.keys(chartConfigs.focus),
};

const defaultSelectedCards = Object.keys(cardConfigs);

const viewTypeLabels = {
  count: "By Count",
  focus: "By Focus",
};
type ViewType = keyof typeof viewTypeLabels;

const timeRangeLabels: Record<TimeRange, string> = {
  "1week": "1 Week",
  "15days": "15 Days",
  "1month": "1 Month",
  "3month": "3 Months",
  "6month": "6 Months",
  "1year": "1 Year",
};

// --- Component ---
export function DeploymentMetricsCompoundChart() {
  const [viewType, setViewType] = React.useState<ViewType>("count");

  // Original Data State
  const [countData, setCountData] = React.useState<DeploymentDataEntry[]>([]);
  const [focusData, setFocusData] = React.useState<DeploymentDataEntry[]>([]);

  // Pre-process count data separately
  const processedCountData = React.useMemo(() => {
    return countData.map((d: DeploymentDataEntry) => ({
      ...d,
      successful: (d.deployments || 0) - (d.failures || 0), // Ensure values exist
    }));
  }, [countData]);

  // Derived Data based on ViewType (for Chart)
  const rawDataForChart = React.useMemo(() => {
    return viewType === "count" ? processedCountData : focusData;
  }, [viewType, processedCountData, focusData]);

  // Fetch original data
  React.useEffect(() => {
    setCountData(generateDeploymentCountData());
    setFocusData(generateDeploymentFocusData());
  }, []);

  // State hook for the CHART data + shared time range controls
  const {
    timeRange,
    setTimeRange,
    filteredData: filteredDataForChart,
  } = useDashboardState<DeploymentDataEntry>({ data: rawDataForChart });

  // Manually filter processedCountData for CARDS based on the shared timeRange
  const filteredCountDataForCards = React.useMemo(() => {
    const today = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1week":
        startDate = subDays(today, 7);
        break;
      case "15days":
        startDate = subDays(today, 15);
        break;
      case "1month":
        startDate = subMonths(today, 1);
        break;
      case "3month":
        startDate = subMonths(today, 3);
        break;
      case "6month":
        startDate = subMonths(today, 6);
        break;
      default:
        startDate = subMonths(today, 12); // 1year
    }
    startDate.setHours(0, 0, 0, 0);

    return processedCountData.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return false;
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate;
    });
  }, [processedCountData, timeRange]);

  const [selectedChartMetrics, setSelectedChartMetrics] = React.useState(
    defaultSelectedChartMetrics
  );
  const [selectedCardMetrics, setSelectedCardMetrics] =
    React.useState(defaultSelectedCards);

  // --- Derived State & Calculations ---
  const currentChartConfig = chartConfigs[viewType];
  const currentSelectedChartMetrics = selectedChartMetrics[viewType];

  // Calculate metric values (use latest point in filtered COUNT data for cards)
  const getMetricValue = React.useCallback(
    (key: string): number => {
      if (filteredCountDataForCards.length === 0) return 0;
      const latestData =
        filteredCountDataForCards[filteredCountDataForCards.length - 1];
      // Handle special combined key for total deployments
      if (key === "deployments")
        return (latestData.successful || 0) + (latestData.failures || 0);
      // Use explicit any cast to bypass persistent linter error
      return (latestData as any)[key] || 0;
    },
    [filteredCountDataForCards]
  );

  // Calculate change percentage (compared to previous point in filtered COUNT data for cards)
  const getChangePercentage = React.useCallback(
    (key: string): number => {
      if (filteredCountDataForCards.length < 2) return 0;
      const latestData =
        filteredCountDataForCards[filteredCountDataForCards.length - 1];
      const previousData =
        filteredCountDataForCards[filteredCountDataForCards.length - 2];

      let currentValue: number | undefined;
      let previousValue: number | undefined;

      // Handle special combined key for total deployments
      if (key === "deployments") {
        currentValue =
          (latestData.successful || 0) + (latestData.failures || 0);
        previousValue =
          (previousData.successful || 0) + (previousData.failures || 0);
      } else {
        // Use explicit any cast to bypass persistent linter error
        currentValue = (latestData as any)[key];
        previousValue = (previousData as any)[key];
      }

      if (previousValue === 0 || previousValue == null) {
        return currentValue === 0 || currentValue == null ? 0 : Infinity;
      }
      return (
        (((currentValue ?? 0) - (previousValue ?? 0)) / previousValue) * 100
      );
    },
    [filteredCountDataForCards]
  );

  // Determine positive/negative change type for cards
  const getCardChangeType = React.useCallback(
    (key: string, change: number): MetricCardData["changeType"] => {
      if (key === "failures" || key === "cfr" || key === "mtr") {
        return change > 0 ? "negative" : change < 0 ? "positive" : "neutral";
      } else {
        return change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
      }
    },
    []
  );

  // Prepare data for Metric Cards
  const metricCards: MetricCardData[] = React.useMemo(
    () =>
      Object.entries(cardConfigs)
        .filter(([key]) => selectedCardMetrics.includes(key))
        .map(([key, config]) => {
          const value = getMetricValue(key);
          const change = getChangePercentage(key);
          let displayValue: number | string = value;

          // Format CFR as percentage, MTR with 'h'
          if (key === "cfr") displayValue = `${value.toFixed(1)}%`;
          if (key === "mtr") displayValue = `${value.toFixed(1)}h`;

          return {
            key,
            title: config.label,
            value: displayValue,
            change: Number(change.toFixed(1)),
            changeType: getCardChangeType(key, change),
          };
        }),
    [
      selectedCardMetrics,
      filteredCountDataForCards, // Correct dependency
      getMetricValue,
      getChangePercentage,
      getCardChangeType,
    ]
  );

  // --- Event Handlers ---
  const handleViewTypeChange = (newViewType: string) => {
    setViewType(newViewType as ViewType);
  };

  const toggleChartMetric = (metric: string) => {
    setSelectedChartMetrics((prev) => {
      const currentMetrics = prev[viewType];
      if (currentMetrics.length === 1 && currentMetrics.includes(metric))
        return prev; // Prevent unselecting last metric
      return {
        ...prev,
        [viewType]: currentMetrics.includes(metric)
          ? currentMetrics.filter((m) => m !== metric)
          : [...currentMetrics, metric],
      };
    });
  };

  const toggleCardMetric = (metric: string) => {
    setSelectedCardMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  // --- Loading State ---
  if (countData.length === 0 || focusData.length === 0) {
    return <div>Loading deployment metrics...</div>;
  }

  // --- Menu Configuration ---
  const menuContent = (
    <Menu
      viewType={viewType}
      setViewType={handleViewTypeChange}
      currentConfig={currentChartConfig}
      currentSelectedMetrics={currentSelectedChartMetrics}
      toggleMetric={toggleChartMetric}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      viewTypeLabels={viewTypeLabels}
      timeRangeLabels={timeRangeLabels}
      cardConfigs={cardConfigs}
      selectedCards={selectedCardMetrics}
      setSelectedCards={setSelectedCardMetrics}
      showViewTypeSelector={true}
      showChartMetricSelector={true}
      showCardSelector={true}
      showTimeRangeSelector={true}
    />
  );

  // --- Render ---
  return (
    <DashboardLayout
      title="Deployment Metrics"
      description={
        viewType === "count"
          ? "Track deployment frequency and failure rates"
          : "Analyze deployment distribution by type and focus"
      }
      menuContent={menuContent}
    >
      <MetricCardGrid
        metrics={metricCards}
        gridClasses="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        className="mb-6"
      />

      <GenericChart
        chartType="stacked-bar" // Always stacked bar
        data={filteredDataForChart} // Use the chart-specific filtered data
        metrics={currentSelectedChartMetrics}
        config={currentChartConfig} // Pass config with colors
        dataKeyX="week"
      />
    </DashboardLayout>
  );
}
