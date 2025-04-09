"use client";

import * as React from "react";
// import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { MetricCardGrid, MetricCardData } from "@/components/menu-card-grid";
import { GenericChart } from "@/components/generic-chart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";
import { generateGoalsData } from "@/data/dataGenerators";
import Menu from "@/components/menu";

interface GoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  productivity: number;
  quality: number;
  learning: number;
  teamwork: number;
  [key: string]: any;
}

interface MetricConfig {
  label: string;
  target?: number;
}

const chartConfigs: { metrics: { [key: string]: MetricConfig } } = {
  metrics: {
    productivity: { label: "Productivity", target: 85 },
    quality: { label: "Code Quality", target: 90 },
    learning: { label: "Learning & Growth", target: 80 },
    teamwork: { label: "Team Collaboration", target: 85 },
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

export function UserGoalsCompoundChart() {
  const [goalsData, setGoalsData] = React.useState<GoalDataEntry[]>([]);

  React.useEffect(() => {
    setGoalsData(generateGoalsData());
  }, []);

  const { timeRange, setTimeRange, filteredData } =
    useDashboardState<GoalDataEntry>({
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
        ? "positive"
        : value < target
          ? "negative"
          : "neutral";
    },
    [currentCardConfig],
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
            value: `${value.toFixed(1)}%`,
            change: Number(change.toFixed(1)),
            changeType: getChangeType(key, value),
          };
        }),
    [
      selectedCardMetrics,
      currentCardConfig,
      getMetricValue,
      getChangePercentage,
      getChangeType,
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
    return <div data-oid="q:-0a9w">Loading goals data...</div>;
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
      data-oid="_zbje_a"
    />
  );

  return (
    <DashboardLayout
      title="Goals Progress"
      description="Track progress towards personal and team goals"
      menuContent={menuContent}
      data-oid=":1m3w0a"
    >
      <MetricCardGrid
        metrics={metricCards}
        gridClasses="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        className="mb-6"
        data-oid="3tdbejg"
      />

      <GenericChart
        chartType="area"
        data={filteredData}
        metrics={selectedChartMetrics}
        config={currentChartConfig}
        dataKeyX="tooltipLabel"
        data-oid="hcmuyyl"
      />
    </DashboardLayout>
  );
}
