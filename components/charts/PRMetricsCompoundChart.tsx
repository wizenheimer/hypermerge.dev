"use client";

import * as React from "react";
// import { BarChart3, Calendar, Check, LineChart } from "lucide-react";

// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command";
import Menu from "@/components/menu";
import {
  generatePRTypeData,
  generatePRStatusData,
  generatePRSizeData,
  generatePRLOCData,
} from "@/data/dataGenerators";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MetricCardGrid, MetricCardData } from "@/components/menu-card-grid";
import { GenericChart } from "@/components/generic-chart";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

// TODO: Define specific types for PR data instead of any[] based on dataGenerators.ts
interface PRDataEntry {
  date: Date; // Or string if ISO date
  week: string;
  [key: string]: any; // Keep flexible for now
}

// --- Configuration --- (Keep specific configs here)
interface MetricConfig {
  label: string;
}
interface ChartConfigs {
  distribution: { [key: string]: MetricConfig };
  status: { [key: string]: MetricConfig };
  size: { [key: string]: MetricConfig };
  loc: { [key: string]: MetricConfig };
}

const chartConfigs: ChartConfigs = {
  distribution: {
    feature: { label: "Feature" },
    enhancement: { label: "Enhancement" },
    bugfix: { label: "Bugfix" },
    refactor: { label: "Refactor" },
    chore: { label: "Chore" },
    security: { label: "Security" },
    documentation: { label: "Documentation" },
    test: { label: "Test" },
  },
  status: {
    open: { label: "Open" },
    inReview: { label: "In Review" },
    merged: { label: "Merged" },
    closed: { label: "Closed" },
    draft: { label: "Draft" },
  },
  size: {
    xs: { label: "XS (< 50 lines)" },
    s: { label: "S (50-200 lines)" },
    m: { label: "M (200-500 lines)" },
    l: { label: "L (500-1000 lines)" },
    xl: { label: "XL (1000-2000 lines)" },
    xxl: { label: "XXL (> 2000 lines)" },
  },
  loc: {
    loc: { label: "Lines of Code" },
    additions: { label: "Additions" },
    deletions: { label: "Deletions" },
    netChange: { label: "Net Change" },
  },
};

const cardConfigs = chartConfigs; // In this case, card configs are the same as chart configs

const defaultSelectedMetrics = {
  distribution: Object.keys(chartConfigs.distribution),
  status: Object.keys(chartConfigs.status),
  size: Object.keys(chartConfigs.size),
  loc: Object.keys(chartConfigs.loc),
};

const viewTypeLabels = {
  distribution: "By Distribution",
  status: "By PR Status",
  size: "By PR Size",
  loc: "By Lines of Code",
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
export function PRMetricsCompoundChart() {
  const [viewType, setViewType] = React.useState<ViewType>("distribution");

  // Original Data State
  const [typeData, setTypeData] = React.useState<PRDataEntry[]>([]);
  const [statusData, setStatusData] = React.useState<PRDataEntry[]>([]);
  const [sizeData, setSizeData] = React.useState<PRDataEntry[]>([]);
  const [locData, setLocData] = React.useState<PRDataEntry[]>([]);

  // Derived Data based on ViewType
  const rawData = React.useMemo(() => {
    switch (viewType) {
      case "status":
        return statusData;
      case "size":
        return sizeData;
      case "loc":
        return locData;
      case "distribution":
      default:
        return typeData;
    }
  }, [viewType, typeData, statusData, sizeData, locData]);

  // Fetch original data
  React.useEffect(() => {
    setTypeData(generatePRTypeData());
    setStatusData(generatePRStatusData());
    setSizeData(generatePRSizeData());
    setLocData(generatePRLOCData());
  }, []);

  // State for selected metrics (chart & cards) and time range
  const { timeRange, setTimeRange, filteredData } = useDashboardState({
    data: rawData,
  });
  const [selectedChartMetrics, setSelectedChartMetrics] = React.useState(
    defaultSelectedMetrics,
  );
  const [selectedCardMetrics, setSelectedCardMetrics] = React.useState(
    defaultSelectedMetrics,
  );

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 3;

  // --- Derived State & Calculations ---
  const currentChartConfig = chartConfigs[viewType];
  const currentCardConfig = cardConfigs[viewType];
  const currentSelectedChartMetrics = selectedChartMetrics[viewType];
  const currentSelectedCardMetrics = selectedCardMetrics[viewType];

  // Calculate metric values (sum over filtered time range)
  const getMetricValue = (key: string) => {
    return filteredData.reduce((sum, item) => sum + (item[key] || 0), 0);
  };

  // Mock change percentage (replace with actual calculation if available)
  const getChangePercentage = (key: string) => {
    // Keep the dummy calculation for now
    return parseFloat((Math.random() * 10 - 5).toFixed(2));
  };

  // Determine positive/negative change type
  const getChangeType = (key: string): MetricCardData["changeType"] => {
    return key === "merged" || key === "feature" || key === "enhancement"
      ? "positive"
      : key === "closed" || key === "bugfix" || key === "security"
        ? "negative"
        : "neutral";
  };

  // Prepare data for Metric Cards
  const allMetricCards: MetricCardData[] = React.useMemo(
    () =>
      Object.entries(currentCardConfig)
        .filter(([key]) => currentSelectedCardMetrics.includes(key))
        .map(([key, config]) => ({
          key,
          title: config.label,
          value: getMetricValue(key),
          change: getChangePercentage(key),
          changeType: getChangeType(key),
        })),
    [
      currentCardConfig,
      currentSelectedCardMetrics,
      filteredData,
      getMetricValue,
      getChangePercentage,
      getChangeType,
    ],
  );

  // Pagination Logic
  const totalPages = Math.ceil(allMetricCards.length / itemsPerPage);
  const paginatedMetricCards = allMetricCards.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  React.useEffect(() => {
    setCurrentPage(0); // Reset to first page when view type or filters change
  }, [viewType, currentSelectedCardMetrics, timeRange]);

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

  // Separate toggle for cards (could be combined if always the same)
  const toggleCardMetric = (metric: string) => {
    setSelectedCardMetrics((prev) => {
      const currentMetrics = prev[viewType];
      // Can potentially allow unselecting all cards, unlike chart metrics
      return {
        ...prev,
        [viewType]: currentMetrics.includes(metric)
          ? currentMetrics.filter((m) => m !== metric)
          : [...currentMetrics, metric],
      };
    });
  };

  // --- Dynamic Grid Class --- (Keep specific logic here)
  const getGridClass = (count: number) => {
    if (count <= 3) return "grid-cols-1 md:grid-cols-3";
    if (count <= 4) return "grid-cols-2 md:grid-cols-4"; // Should not happen with itemsPerPage=3
    if (count <= 6) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"; // Should not happen
    return "grid-cols-2 md:grid-cols-4 lg:grid-cols-8"; // Should not happen
  };

  // --- Loading State ---
  if (
    typeData.length === 0 ||
    statusData.length === 0 ||
    sizeData.length === 0 ||
    locData.length === 0
  ) {
    // Basic loading state, consider a more robust skeleton loader
    return <div data-oid="kchb7f1">Loading metrics data...</div>;
  }

  // --- Menu Configuration ---
  const menuContent = (
    <Menu
      viewType={viewType}
      setViewType={handleViewTypeChange} // Use the handler
      currentConfig={currentChartConfig} // Pass chart config for metric selection
      currentSelectedMetrics={currentSelectedChartMetrics} // Pass chart selections
      toggleMetric={toggleChartMetric} // Use chart toggle handler
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      viewTypeLabels={viewTypeLabels}
      timeRangeLabels={timeRangeLabels}
      // Card Selection Specific Props
      cardConfigs={currentCardConfig}
      selectedCards={currentSelectedCardMetrics}
      setSelectedCards={(cards) =>
        setSelectedCardMetrics((prev) => ({ ...prev, [viewType]: cards }))
      } // Update card selections
      showViewTypeSelector={true} // Enable view type selector
      showChartMetricSelector={true} // Enable chart metric selector
      showCardSelector={true} // Enable card selector
      showTimeRangeSelector={true} // Enable time range selector
      data-oid="beyk3q8"
    />
  );

  // --- Render ---
  return (
    <DashboardLayout
      title="Pull Request Metrics"
      description={
        viewType === "distribution"
          ? "Analyze PR types and distribution"
          : viewType === "status"
            ? "Monitor PR status and lifecycle"
            : viewType === "size"
              ? "Track PR sizes over time"
              : "Analyze code changes (LOC metrics)"
      }
      menuContent={menuContent}
      pagination={{
        currentPage,
        handlePreviousPage,
        handleNextPage,
        isPrevDisabled: currentPage === 0,
        isNextDisabled: currentPage + 1 >= totalPages,
        totalPages,
      }}
      data-oid="d_6:v.w"
    >
      <MetricCardGrid
        metrics={paginatedMetricCards}
        gridClasses={getGridClass(paginatedMetricCards.length)} // Use dynamic grid class
        className="mb-6"
        data-oid="gcifqlw"
      />

      <GenericChart
        chartType="stacked-bar" // Always stacked bar for this dashboard
        data={filteredData}
        metrics={currentSelectedChartMetrics}
        config={currentChartConfig}
        dataKeyX="week" // Assuming 'week' is the common key
        data-oid="0m.j-8q"
      />
    </DashboardLayout>
  );
}
