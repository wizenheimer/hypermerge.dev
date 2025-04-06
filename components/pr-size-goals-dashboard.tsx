"use client";

import * as React from "react";
import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "./Menu";
import { DashboardLayout } from "./DashboardLayout";
import { MetricCardGrid, MetricCardData } from "./MetricCardGrid";
import { GenericChart } from "./GenericChart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

interface PRSizeGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  smallPRPercentage: number;
  avgPRSize: number;
  reviewTime: number;
  mergeSuccess: number;
  [key: string]: any;
}

interface MetricConfig {
  label: string;
  target?: number;
  description: string;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    smallPRPercentage: {
      label: "Small PRs (<200 LOC)",
      target: 80,
      description: "Percentage of PRs under 200 lines of code",
    },
    avgPRSize: {
      label: "Average PR Size",
      target: 150,
      description: "Average lines of code per PR",
    },
    reviewTime: {
      label: "Review Time",
      target: 24,
      description: "Average hours to complete review",
    },
    mergeSuccess: {
      label: "Merge Success Rate",
      target: 95,
      description: "Percentage of PRs merged without conflicts",
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

// Mock data generator with realistic PR size metrics
const generatePRSizeGoalsData = (): PRSizeGoalDataEntry[] => {
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
      // Percentage of small PRs should increase (target: 80%)
      smallPRPercentage: Math.min(
        95,
        Math.max(40, 60 + progress * 20 + randomVariation())
      ),
      // Average PR size should decrease (target: 150 LOC)
      avgPRSize: Math.max(
        100,
        Math.min(500, 300 - progress * 150 + randomVariation() * 5)
      ),
      // Review time should decrease (target: 24 hours)
      reviewTime: Math.max(
        12,
        Math.min(72, 48 - progress * 24 + randomVariation())
      ),
      // Merge success rate should increase (target: 95%)
      mergeSuccess: Math.min(
        100,
        Math.max(75, 85 + progress * 10 + randomVariation())
      ),
    });
  }
  return data;
};

export function PRSizeGoalsDashboard() {
  const [goalsData, setGoalsData] = React.useState<PRSizeGoalDataEntry[]>([]);

  React.useEffect(() => {
    setGoalsData(generatePRSizeGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<PRSizeGoalDataEntry>({
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

    // For metrics where lower is better (avgPRSize and reviewTime)
    if (key === "avgPRSize" || key === "reviewTime") {
      if (value <= target) return "positive";
      if (value <= target * 1.1) return "neutral";
      return "negative";
    }

    // For metrics where higher is better (smallPRPercentage and mergeSuccess)
    if (value >= target) return "positive";
    if (value >= target * 0.9) return "neutral";
    return "negative";
  };

  const formatValue = (key: string, value: number): string => {
    switch (key) {
      case "avgPRSize":
        return `${Math.round(value)} LOC`;
      case "reviewTime":
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
    return <div>Loading PR size goals data...</div>;
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
      title="PR Size Goals"
      description="Track and improve pull request size metrics"
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
