import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { getColorFromPalette } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ChartConfigItem {
  label: string;
  color?: string;
}

interface GenericChartProps {
  chartType: "bar" | "stacked-bar" | "area";
  data: any[];
  metrics: string[];
  config: Record<string, ChartConfigItem>;
  dataKeyX: string; // Key for the X-axis data (e.g., 'week', 'date')
  className?: string;
  xAxisInterval?: number;
}

export function GenericChart({
  chartType,
  data,
  metrics,
  config,
  dataKeyX,
  className = "",
  xAxisInterval = 3,
}: GenericChartProps) {
  const renderBars = () => {
    return metrics.map((metric, index) => (
      <Bar
        key={metric}
        dataKey={metric}
        name={config[metric]?.label || metric}
        fill={config[metric]?.color || getColorFromPalette(index)}
        stackId={chartType === "stacked-bar" ? "a" : undefined}
      />
    ));
  };

  const renderAreas = () => {
    // Reverse for proper stacking visually in Area charts
    const reversedMetrics = [...metrics].reverse();
    return reversedMetrics.map((metric, index) => {
      // Calculate color based on original index if using palette
      const originalIndex = metrics.indexOf(metric);
      const color = config[metric]?.color || getColorFromPalette(originalIndex);
      return (
        <Area
          key={metric}
          type="linear"
          dataKey={metric}
          name={config[metric]?.label || metric}
          stackId="1" // Areas always stack
          stroke={color}
          fill={`url(#gradient-${metric})`}
          strokeWidth={1}
        />
      );
    });
  };

  const renderAreaGradients = () => {
    // Reverse for proper stacking visually in Area charts
    const reversedMetrics = [...metrics].reverse();
    return reversedMetrics.map((metric, index) => {
      // Calculate color based on original index if using palette
      const originalIndex = metrics.indexOf(metric);
      const color = config[metric]?.color || getColorFromPalette(originalIndex);
      return (
        <linearGradient
          key={`gradient-${metric}`}
          id={`gradient-${metric}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="5%" stopColor={color} stopOpacity={0.8} />
          <stop offset="95%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
      );
    });
  };

  const ChartComponent =
    chartType === "area" ? RechartsAreaChart : RechartsBarChart;

  // Prepare chartConfig for ChartContainer (ensuring labels)
  const chartContainerConfig = Object.entries(config).reduce(
    (acc, [key, value]) => {
      if (metrics.includes(key)) {
        acc[key] = { label: value.label };
      }
      return acc;
    },
    {} as Record<string, { label: string }>
  );

  return (
    <div className={cn("h-[400px] w-full overflow-hidden", className)}>
      <ChartContainer config={chartContainerConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            {chartType === "area" && <defs>{renderAreaGradients()}</defs>}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={dataKeyX}
              tickFormatter={(value) => value} // Keep basic formatter, specific ones handled in dashboard
              interval={xAxisInterval}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fontSize: 12 }}
              height={30}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            {chartType === "area" ? renderAreas() : renderBars()}
          </ChartComponent>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
