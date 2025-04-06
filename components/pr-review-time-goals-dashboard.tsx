"use client";

import * as React from "react";
import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "./Menu";
import { DashboardLayout } from "./DashboardLayout";
import { MetricCardGrid, MetricCardData } from "./MetricCardGrid";
import { GenericChart } from "./GenericChart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

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

// Mock data generator with realistic PR review time metrics
const generatePRReviewTimeGoalsData = (): PRReviewTimeGoalDataEntry[] => {
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
      // Review completion time should decrease (target: 24 hours)
      reviewCompletionTime: Math.max(
        12,
        Math.min(48, 36 - progress * 12 + randomVariation() * 0.5)
      ),
      // Stale review rate should decrease (target: 5%)
      staleReviewRate: Math.max(
        2,
        Math.min(20, 15 - progress * 10 + randomVariation() * 0.5)
      ),
      // Average iterations should decrease (target: 2)
      iterationCount: Math.max(
        1,
        Math.min(4, 3 - progress * 1 + randomVariation() * 0.1)
      ),
      // First-pass success rate should increase (target: 70%)
      firstPassRate: Math.min(
        90,
        Math.max(40, 50 + progress * 20 + randomVariation())
      ),
    });
  }
  return data;
};

export function PRReviewTimeGoalsDashboard() {
  const [goalsData, setGoalsData] = React.useState<PRReviewTimeGoalDataEntry[]>(
    []
  );

  React.useEffect(() => {
    setGoalsData(generatePRReviewTimeGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<PRReviewTimeGoalDataEntry>({
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

    // For metrics where lower is better (reviewCompletionTime, staleReviewRate, iterationCount)
    if (
      key === "reviewCompletionTime" ||
      key === "staleReviewRate" ||
      key === "iterationCount"
    ) {
      if (value <= target) return "positive";
      if (value <= target * 1.5) return "neutral";
      return "negative";
    }

    // For metrics where higher is better (firstPassRate)
    if (value >= target) return "positive";
    if (value >= target * 0.9) return "neutral";
    return "negative";
  };

  const formatValue = (key: string, value: number): string => {
    switch (key) {
      case "reviewCompletionTime":
        return `${value.toFixed(1)}h`;
      case "iterationCount":
        return value.toFixed(1);
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
    return <div>Loading PR review time goals data...</div>;
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
      title="PR Review Time Goals"
      description="Track and improve pull request review completion time"
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
