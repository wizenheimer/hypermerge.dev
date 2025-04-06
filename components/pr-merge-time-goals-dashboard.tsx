"use client";

import * as React from "react";
import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "./Menu";
import { DashboardLayout } from "./DashboardLayout";
import { MetricCardGrid, MetricCardData } from "./MetricCardGrid";
import { GenericChart } from "./GenericChart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

interface PRMergeTimeGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  mergeTime: number;
  staleMergeRate: number;
  mergeSuccessRate: number;
  conflictRate: number;
  [key: string]: any;
}

interface MetricConfig {
  label: string;
  target?: number;
  description: string;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    mergeTime: {
      label: "Merge Time",
      target: 48,
      description: "Average hours from PR creation to merge",
    },
    staleMergeRate: {
      label: "Stale Merge Rate",
      target: 5,
      description: "Percentage of PRs not merged within 48 hours",
    },
    mergeSuccessRate: {
      label: "Merge Success Rate",
      target: 95,
      description: "Percentage of approved PRs successfully merged",
    },
    conflictRate: {
      label: "Conflict Rate",
      target: 10,
      description: "Percentage of PRs requiring conflict resolution",
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

// Mock data generator with realistic PR merge time metrics
const generatePRMergeTimeGoalsData = (): PRMergeTimeGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 10; // ±5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // Merge time should decrease (target: 48 hours)
      mergeTime: Math.max(
        24,
        Math.min(72, 60 - progress * 24 + randomVariation())
      ),
      // Stale merge rate should decrease (target: 5%)
      staleMergeRate: Math.max(
        2,
        Math.min(20, 15 - progress * 10 + randomVariation() * 0.5)
      ),
      // Merge success rate should increase (target: 95%)
      mergeSuccessRate: Math.min(
        100,
        Math.max(80, 85 + progress * 10 + randomVariation())
      ),
      // Conflict rate should decrease (target: 10%)
      conflictRate: Math.max(
        5,
        Math.min(25, 20 - progress * 10 + randomVariation() * 0.5)
      ),
    });
  }
  return data;
};

export function PRMergeTimeGoalsDashboard() {
  const [goalsData, setGoalsData] = React.useState<PRMergeTimeGoalDataEntry[]>(
    []
  );

  React.useEffect(() => {
    setGoalsData(generatePRMergeTimeGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<PRMergeTimeGoalDataEntry>({
      data: goalsData,
    });

  const [selectedChartMetrics, setSelectedChartMetrics] = React.useState(
    defaultSelectedMetrics
  );
  const [selectedCardMetrics, setSelectedCardMetrics] =
    React.useState(defaultSelectedCards);

  const currentChartConfig = chartConfigs.metrics;
  const currentCardConfig = cardConfigs;

  const getMetricValue = (key: string): number => {
    if (filteredData.length === 0) return 0;
    const latestData = filteredData[filteredData.length - 1];
    return latestData[key] || 0;
  };

  const getChangePercentage = (key: string): number => {
    if (filteredData.length < 2) return 0;
    const currentValue = filteredData[filteredData.length - 1][key] || 0;
    const previousValue = filteredData[filteredData.length - 2][key] || 0;
    if (previousValue === 0) return currentValue === 0 ? 0 : Infinity;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const getChangeType = (
    key: string,
    value: number
  ): MetricCardData["changeType"] => {
    const target = currentCardConfig[key].target;
    if (!target) return "neutral";

    // For metrics where lower is better (mergeTime, staleMergeRate, conflictRate)
    if (
      key === "mergeTime" ||
      key === "staleMergeRate" ||
      key === "conflictRate"
    ) {
      if (value <= target) return "positive";
      if (value <= target * 1.5) return "neutral";
      return "negative";
    }

    // For metrics where higher is better (mergeSuccessRate)
    if (value >= target) return "positive";
    if (value >= target * 0.9) return "neutral";
    return "negative";
  };

  const formatValue = (key: string, value: number): string => {
    switch (key) {
      case "mergeTime":
        return `${value.toFixed(1)}h`;
      default:
        return `${value.toFixed(1)}%`;
    }
  };

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
    [selectedCardMetrics, filteredData, currentCardConfig]
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
    return <div>Loading PR merge time goals data...</div>;
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
    />
  );

  return (
    <DashboardLayout
      title="PR Merge Time Goals"
      description="Track and improve pull request merge completion time"
      menuContent={menuContent}
    >
      <MetricCardGrid
        metrics={metricCards}
        gridClasses="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        className="mb-6"
      />

      <GenericChart
        chartType="area"
        data={filteredData}
        metrics={selectedChartMetrics}
        config={currentChartConfig}
        dataKeyX="week"
      />
    </DashboardLayout>
  );
}
