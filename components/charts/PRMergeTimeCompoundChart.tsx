"use client";

import * as React from "react";
// import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MetricCardGrid, MetricCardData } from "@/components/menu-card-grid";
import { GenericChart } from "@/components/generic-chart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";
import { generatePRMergeTimeGoalsData } from "@/data/dataGenerators";

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

export function PRMergeTimeCompoundChart() {
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

  const getMetricValue = React.useCallback(
    (key: string): number => {
      if (filteredData.length === 0) return 0;
      const latestData = filteredData[filteredData.length - 1];
      return (latestData as any)[key] || 0;
    },
    [filteredData]
  );

  const getChangePercentage = React.useCallback(
    (key: string): number => {
      if (filteredData.length < 2) return 0;
      const currentValue = filteredData[filteredData.length - 1][key] || 0;
      const previousValue = filteredData[filteredData.length - 2][key] || 0;
      if (previousValue === 0) return currentValue === 0 ? 0 : Infinity;
      return ((currentValue - previousValue) / previousValue) * 100;
    },
    [filteredData]
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
    [currentCardConfig]
  );

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
    [
      selectedCardMetrics,
      currentCardConfig,
      getMetricValue,
      getChangePercentage,
      getChangeType,
    ]
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
    return <div data-oid="s17agw0">Loading PR merge time goals data...</div>;
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
      data-oid=":57vw45"
    />
  );

  return (
    <DashboardLayout
      title="PR Merge Time Goals"
      description="Track and improve pull request merge completion time"
      menuContent={menuContent}
      data-oid=".ecg:ew"
    >
      <MetricCardGrid
        metrics={metricCards}
        gridClasses="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        className="mb-6"
        data-oid="hlv4y6u"
      />

      <GenericChart
        chartType="area"
        data={filteredData}
        metrics={selectedChartMetrics}
        config={currentChartConfig}
        dataKeyX="tooltipLabel"
        data-oid="07dr:6-"
      />
    </DashboardLayout>
  );
}
