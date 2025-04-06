"use client";

import * as React from "react";
import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "./Menu";
import { DashboardLayout } from "./DashboardLayout";
import { MetricCardGrid, MetricCardData } from "./MetricCardGrid";
import { GenericChart } from "./GenericChart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

interface PRReviewGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  reviewCoverage: number;
  reviewerCount: number;
  timeToFirstReview: number;
  approvalRate: number;
  [key: string]: any;
}

interface MetricConfig {
  label: string;
  target?: number;
  description: string;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    reviewCoverage: {
      label: "Review Coverage",
      target: 100,
      description: "Percentage of PRs that received at least one review",
    },
    reviewerCount: {
      label: "Reviewers per PR",
      target: 2,
      description: "Average number of reviewers per pull request",
    },
    timeToFirstReview: {
      label: "Time to First Review",
      target: 4,
      description: "Average hours until first review comment",
    },
    approvalRate: {
      label: "Approval Rate",
      target: 90,
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

// Mock data generator with realistic PR review metrics
const generatePRReviewGoalsData = (): PRReviewGoalDataEntry[] => {
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
      // Review coverage should be very high (target: 100%)
      reviewCoverage: Math.min(
        100,
        Math.max(80, 90 + progress * 10 + randomVariation())
      ),
      // Average reviewers per PR should increase (target: 2)
      reviewerCount: Math.min(
        3,
        Math.max(1, 1.5 + progress * 0.5 + randomVariation() * 0.1)
      ),
      // Time to first review should decrease (target: 4 hours)
      timeToFirstReview: Math.max(
        2,
        Math.min(12, 8 - progress * 4 + randomVariation() * 0.5)
      ),
      // Approval rate should increase (target: 90%)
      approvalRate: Math.min(
        100,
        Math.max(70, 75 + progress * 15 + randomVariation())
      ),
    });
  }
  return data;
};

export function PRReviewGoalsDashboard() {
  const [goalsData, setGoalsData] = React.useState<PRReviewGoalDataEntry[]>([]);

  React.useEffect(() => {
    setGoalsData(generatePRReviewGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<PRReviewGoalDataEntry>({
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

    // For metrics where lower is better (timeToFirstReview)
    if (key === "timeToFirstReview") {
      if (value <= target) return "positive";
      if (value <= target * 1.5) return "neutral";
      return "negative";
    }

    // For metrics where higher is better (all others)
    if (value >= target) return "positive";
    if (value >= target * 0.9) return "neutral";
    return "negative";
  };

  const formatValue = (key: string, value: number): string => {
    switch (key) {
      case "reviewerCount":
        return value.toFixed(1);
      case "timeToFirstReview":
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
    return <div>Loading PR review goals data...</div>;
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
      title="PR Review Goals"
      description="Track and improve pull request review process"
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
