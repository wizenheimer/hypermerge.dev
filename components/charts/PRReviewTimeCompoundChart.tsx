"use client";

import * as React from "react";
// import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MetricCardGrid, MetricCardData } from "@/components/menu-card-grid";
import { GenericChart } from "@/components/generic-chart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";
import { generatePRReviewTimeGoalsData } from "@/data/dataGenerators";

interface PRReviewTimeGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  reviewCompletionTime: number;
  staleReviewRate: number;
  iterationCount: number;
  firstPassRate: number;
  [key: string]: any;
}

interface MetricConfig {
  label: string;
  target?: number;
  description: string;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    reviewCompletionTime: {
      label: "Review Completion Time",
      target: 24,
      description: "Average hours to complete full review cycle",
    },
    staleReviewRate: {
      label: "Stale Review Rate",
      target: 5,
      description: "Percentage of reviews not completed within 24 hours",
    },
    iterationCount: {
      label: "Review Iterations",
      target: 2,
      description: "Average number of review cycles before approval",
    },
    firstPassRate: {
      label: "First-Pass Success",
      target: 70,
      description: "Percentage of PRs approved on first review",
    },
  },
};

const cardConfigs = chartConfigs.metrics;

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

export function PRReviewTimeCompoundChart() {
  const [goalsData, setGoalsData] = React.useState<PRReviewTimeGoalDataEntry[]>(
    [],
  );

  React.useEffect(() => {
    setGoalsData(generatePRReviewTimeGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<PRReviewTimeGoalDataEntry>({
      data: goalsData,
    });

  const [selectedChartMetrics, setSelectedChartMetrics] = React.useState(
    defaultSelectedMetrics,
  );
  const [selectedCardMetrics, setSelectedCardMetrics] =
    React.useState(defaultSelectedCards);

  const currentChartConfig = chartConfigs.metrics;
  const currentCardConfig = cardConfigs;

  const getMetricValue = React.useCallback(
    (key: string): number => {
      if (filteredData.length === 0) return 0;
      const latestData = filteredData[filteredData.length - 1];
      return (latestData as any)[key] || 0;
    },
    [filteredData],
  );

  const getChangePercentage = React.useCallback(
    (key: string): number => {
      if (filteredData.length < 2) return 0;
      const currentValue = filteredData[filteredData.length - 1][key] || 0;
      const previousValue = filteredData[filteredData.length - 2][key] || 0;
      if (previousValue === 0) return currentValue === 0 ? 0 : Infinity;
      return ((currentValue - previousValue) / previousValue) * 100;
    },
    [filteredData],
  );

  const getChangeType = React.useCallback(
    (key: string, value: number): MetricCardData["changeType"] => {
      const target = currentCardConfig[key]?.target;
      if (target === undefined) return "neutral";
      return value > target
        ? "negative"
        : value < target
          ? "positive"
          : "neutral";
    },
    [currentCardConfig],
  );

  const formatValue = React.useCallback(
    (key: string, value: number): string => {
      if (key === "reviewCompletionTime" || key === "iterationCount") {
        return `${value.toFixed(1)}h`;
      }
      if (key === "staleReviewRate" || key === "firstPassRate") {
        return `${value.toFixed(1)}%`;
      }
      return value.toString();
    },
    [],
  );

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
            value: formatValue(key, value),
            change: Number(change.toFixed(1)),
            changeType: getChangeType(key, value),
            description: config.description,
          };
        }),
    [
      selectedCardMetrics,
      currentCardConfig,
      getMetricValue,
      getChangePercentage,
      getChangeType,
      formatValue,
    ],
  );

  const toggleChartMetric = (metric: string) => {
    setSelectedChartMetrics((prev) => {
      if (prev.length === 1 && prev.includes(metric)) return prev;
      return prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric];
    });
  };

  if (goalsData.length === 0) {
    return <div data-oid="mbl2_m_">Loading PR review time goals data...</div>;
  }

  const menuContent = (
    <Menu
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
      data-oid="128lzoy"
    />
  );

  return (
    <DashboardLayout
      title="PR Review Time Goals"
      description="Track and improve pull request review completion time"
      menuContent={menuContent}
      data-oid="8yn2cml"
    >
      <MetricCardGrid
        metrics={metricCards}
        gridClasses="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        className="mb-6"
        data-oid="kkp4dw2"
      />

      <GenericChart
        chartType="area"
        data={filteredData}
        metrics={selectedChartMetrics}
        config={currentChartConfig}
        dataKeyX="tooltipLabel"
        data-oid="-xhpu0o"
      />
    </DashboardLayout>
  );
}
