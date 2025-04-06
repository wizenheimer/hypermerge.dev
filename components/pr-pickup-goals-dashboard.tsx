"use client";

import * as React from "react";
import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "./Menu";
import { DashboardLayout } from "./DashboardLayout";
import { MetricCardGrid, MetricCardData } from "./MetricCardGrid";
import { GenericChart } from "./GenericChart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

interface PRPickupGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  pickupTime: number;
  staleRate: number;
  assigneePickupRate: number;
  teamResponseTime: number;
  [key: string]: any;
}

interface MetricConfig {
  label: string;
  target?: number;
  description: string;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    pickupTime: {
      label: "Pickup Time",
      target: 12,
      description: "Average hours until PR is picked up for review",
    },
    staleRate: {
      label: "Stale PR Rate",
      target: 5,
      description: "Percentage of PRs not picked up within 12 hours",
    },
    assigneePickupRate: {
      label: "Assignee Pickup Rate",
      target: 90,
      description: "Percentage of PRs picked up by assigned reviewers",
    },
    teamResponseTime: {
      label: "Team Response Time",
      target: 4,
      description: "Average hours until any team interaction",
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

// Mock data generator with realistic PR pickup metrics
const generatePRPickupGoalsData = (): PRPickupGoalDataEntry[] => {
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
      // Average pickup time should decrease (target: 12 hours)
      pickupTime: Math.max(
        4,
        Math.min(24, 18 - progress * 6 + randomVariation() * 0.5)
      ),
      // Stale PR rate should decrease (target: 5%)
      staleRate: Math.max(
        2,
        Math.min(20, 15 - progress * 10 + randomVariation() * 0.5)
      ),
      // Assignee pickup rate should increase (target: 90%)
      assigneePickupRate: Math.min(
        100,
        Math.max(70, 75 + progress * 15 + randomVariation())
      ),
      // Team response time should decrease (target: 4 hours)
      teamResponseTime: Math.max(
        2,
        Math.min(12, 8 - progress * 4 + randomVariation() * 0.3)
      ),
    });
  }
  return data;
};

export function PRPickupGoalsDashboard() {
  const [goalsData, setGoalsData] = React.useState<PRPickupGoalDataEntry[]>([]);

  React.useEffect(() => {
    setGoalsData(generatePRPickupGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<PRPickupGoalDataEntry>({
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

    // For metrics where lower is better (pickupTime, staleRate, teamResponseTime)
    if (
      key === "pickupTime" ||
      key === "staleRate" ||
      key === "teamResponseTime"
    ) {
      if (value <= target) return "positive";
      if (value <= target * 1.5) return "neutral";
      return "negative";
    }

    // For metrics where higher is better (assigneePickupRate)
    if (value >= target) return "positive";
    if (value >= target * 0.9) return "neutral";
    return "negative";
  };

  const formatValue = (key: string, value: number): string => {
    switch (key) {
      case "pickupTime":
      case "teamResponseTime":
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
    return <div>Loading PR pickup goals data...</div>;
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
      title="PR Pickup Goals"
      description="Track and improve pull request pickup time and responsiveness"
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
