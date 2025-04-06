"use client";

import * as React from "react";
import { subDays, subMonths } from "date-fns";

export type TimeRange =
  | "1week"
  | "15days"
  | "1month"
  | "3month"
  | "6month"
  | "1year";

interface UseDashboardStateProps<T> {
  initialTimeRange?: TimeRange;
  data: T[];
  dateField?: keyof T; // Optional: specify the date field if not 'date'
}

export function useDashboardState<T>({
  initialTimeRange = "1year",
  data,
  dateField = "date" as keyof T,
}: UseDashboardStateProps<T>) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>(initialTimeRange);
  const [filteredData, setFilteredData] = React.useState<T[]>([]);

  React.useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    const today = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1week":
        startDate = subDays(today, 7);
        break;
      case "15days":
        startDate = subDays(today, 15);
        break;
      case "1month":
        startDate = subMonths(today, 1);
        break;
      case "3month":
        startDate = subMonths(today, 3);
        break;
      case "6month":
        startDate = subMonths(today, 6);
        break;
      default: // 1year
        startDate = subMonths(today, 12);
    }

    // Ensure startDate is set to the beginning of the day for consistent comparison
    startDate.setHours(0, 0, 0, 0);

    const filterData = (items: T[]) => {
      return items.filter((item) => {
        const itemDateValue = item[dateField];
        if (!itemDateValue) return false;

        // Handle both Date objects and ISO string dates
        const itemDate =
          itemDateValue instanceof Date
            ? itemDateValue
            : new Date(itemDateValue as string);

        // Ensure itemDate is valid before comparison
        if (isNaN(itemDate.getTime())) {
            // console.warn("Invalid date encountered in data:", item);
            return false;
        }

        // Set itemDate to the beginning of the day for consistent comparison
        itemDate.setHours(0, 0, 0, 0);

        return itemDate >= startDate;
      });
    };

    setFilteredData(filterData(data));
  }, [timeRange, data, dateField]);

  return {
    timeRange,
    setTimeRange,
    filteredData,
  };
} 