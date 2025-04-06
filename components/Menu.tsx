import React from "react";
import { BarChart3, LineChart, Calendar, Check } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState"; // Assuming TimeRange is exported from here

interface MenuProps {
  // Optional props (might not be present in all dashboards)
  viewType?: string;
  setViewType?: (viewType: string) => void;
  viewTypeLabels?: Record<string, string>;
  currentConfig?: Record<string, { label: string }>;
  currentSelectedMetrics?: string[];
  toggleMetric?: (metric: string) => void;
  cardConfigs?: Record<string, { label: string }>;
  selectedCards?: string[];
  setSelectedCards?: (cards: string[] | ((prev: string[]) => string[])) => void; // Allow function updates

  // Required props (assuming always present)
  timeRange: string; // Keep as string for flexibility, or use TimeRange if strictly enforced
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>; // Changed back to use TimeRange type
  timeRangeLabels: Record<string, string>;

  // Control flags (added during refactor)
  showViewTypeSelector?: boolean;
  showChartMetricSelector?: boolean;
  showCardSelector?: boolean;
  showTimeRangeSelector?: boolean;
}

const Menu: React.FC<MenuProps> = ({
  viewType,
  setViewType,
  currentConfig,
  currentSelectedMetrics,
  toggleMetric,
  timeRange,
  setTimeRange,
  viewTypeLabels,
  timeRangeLabels,
  selectedCards,
  setSelectedCards,
  cardConfigs,
  showViewTypeSelector = false,
  showChartMetricSelector = false,
  showCardSelector = false,
  showTimeRangeSelector = true, // Default to true as it's usually present
}) => {
  const menuGroups = [];

  // 1. View Type Selector (Conditional)
  if (showViewTypeSelector && viewTypeLabels && setViewType) {
    menuGroups.push({
      items: [
        {
          label: "View Type",
          icon: BarChart3,
          content: (
            <CommandGroup>
              {Object.entries(viewTypeLabels).map(([key, label]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => setViewType(key)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      viewType === key ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          ),
        },
      ],
    });
  }

  // 2. Chart Metrics Selector (Conditional)
  if (
    showChartMetricSelector &&
    currentConfig &&
    currentSelectedMetrics &&
    toggleMetric
  ) {
    menuGroups.push({
      items: [
        {
          label: "Chart Metrics",
          icon: LineChart,
          content: (
            <CommandGroup>
              {Object.entries(currentConfig).map(([key, config]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => toggleMetric(key)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentSelectedMetrics.includes(key)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {config.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ),
        },
      ],
    });
  }

  // 3. Card Selector (Conditional)
  if (showCardSelector && cardConfigs && selectedCards && setSelectedCards) {
    menuGroups.push({
      items: [
        {
          label: "Cards",
          icon: BarChart3, // Using BarChart3 icon for consistency, change if needed
          content: (
            <CommandGroup>
              {Object.entries(cardConfigs).map(([key, config]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => {
                    // Use functional update form if needed
                    if (typeof setSelectedCards === "function") {
                      setSelectedCards((prev = []) =>
                        prev.includes(key)
                          ? prev.filter((card) => card !== key)
                          : [...prev, key]
                      );
                    } else {
                      // Handle direct array setting if needed, though less common with useState
                      const newSelected = selectedCards.includes(key)
                        ? selectedCards.filter((card) => card !== key)
                        : [...selectedCards, key];
                      setSelectedCards(newSelected); // This branch might be unused if only state setters are passed
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCards.includes(key) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {config.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ),
        },
      ],
    });
  }

  // 4. Time Range Selector (Conditional but usually shown)
  if (showTimeRangeSelector && timeRangeLabels && setTimeRange) {
    menuGroups.push({
      items: [
        {
          label: "Time Range",
          icon: Calendar,
          content: (
            <CommandGroup>
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => setTimeRange(key as TimeRange)} // Cast key to TimeRange
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      timeRange === key ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          ),
        },
      ],
    });
  }

  return (
    <Sidebar collapsible="none" className="bg-transparent">
      <SidebarContent className="overflow-y-auto max-h-96">
        {" "}
        {/* Increased max height slightly */}
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="border-b last:border-none">
            <SidebarGroupContent className="gap-0">
              <SidebarMenu>
                {group.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={itemIndex}>
                    <Command className="w-full">
                      <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.content}
                    </Command>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default Menu;
