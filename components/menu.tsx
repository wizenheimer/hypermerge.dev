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

  // Column selector props
  columns?: any[];
  columnVisibility?: Record<string, boolean>;
  setColumnVisibility?: (visibility: Record<string, boolean>) => void;

  // Required props (assuming always present)
  timeRange: string; // Keep as string for flexibility, or use TimeRange if strictly enforced
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>; // Changed back to use TimeRange type
  timeRangeLabels: Record<string, string>;

  // Control flags (added during refactor)
  showViewTypeSelector?: boolean;
  showChartMetricSelector?: boolean;
  showCardSelector?: boolean;
  showTimeRangeSelector?: boolean;
  showColumnSelector?: boolean;
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
  columns,
  columnVisibility,
  setColumnVisibility,
  showViewTypeSelector = false,
  showChartMetricSelector = false,
  showCardSelector = false,
  showTimeRangeSelector = true, // Default to true as it's usually present
  showColumnSelector = false,
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
            <CommandGroup data-oid="m5j_wtx">
              {Object.entries(viewTypeLabels).map(([key, label]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => setViewType(key)}
                  data-oid="j.6w25z"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      viewType === key ? "opacity-100" : "opacity-0"
                    )}
                    data-oid="nfxe097"
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
            <CommandGroup data-oid=":3_psrs">
              {Object.entries(currentConfig).map(([key, config]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => toggleMetric(key)}
                  data-oid="kfx89a2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentSelectedMetrics.includes(key)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                    data-oid="xt1k42_"
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
            <CommandGroup data-oid="qrs.s0u">
              {Object.entries(cardConfigs).map(([key, config]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => {
                    if (setSelectedCards) {
                      const newSelected = selectedCards?.includes(key)
                        ? selectedCards.filter((card) => card !== key)
                        : [...(selectedCards || []), key];
                      setSelectedCards(newSelected);
                    }
                  }}
                  data-oid="vpi7tm6"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCards.includes(key) ? "opacity-100" : "opacity-0"
                    )}
                    data-oid="7kfwpvw"
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
            <CommandGroup data-oid="6ree2wj">
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => setTimeRange(key as TimeRange)} // Cast key to TimeRange
                  data-oid="y1quz3n"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      timeRange === key ? "opacity-100" : "opacity-0"
                    )}
                    data-oid="o2r1zdi"
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

  // 5. Column Selector (Conditional)
  if (
    showColumnSelector &&
    columns &&
    columnVisibility &&
    setColumnVisibility
  ) {
    menuGroups.push({
      items: [
        {
          label: "Table Columns",
          icon: BarChart3,
          content: (
            <CommandGroup data-oid="wpg5p:o">
              {columns
                .filter((column) => {
                  // Skip columns that can't be hidden
                  if (!column.getCanHide()) return false;
                  return true;
                })
                .map((column) => {
                  const isVisible = column.getIsVisible();

                  // Get a display name for the column
                  let label = "";
                  if (column.id) {
                    // Remove 'metrics.' prefix and format the remaining text
                    label = column.id
                      .replace("metrics.", "")
                      .split("_")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ");
                  }

                  return (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={() => column.toggleVisibility()}
                      data-oid="yps6.:u"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isVisible ? "opacity-100" : "opacity-0"
                        )}
                        data-oid="-jvafgj"
                      />

                      {label}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          ),
        },
      ],
    });
  }

  return (
    <Sidebar collapsible="none" className="bg-transparent" data-oid=".mokap1">
      <SidebarContent className="overflow-y-auto max-h-96" data-oid="mw7vttq">
        {" "}
        {/* Increased max height slightly */}
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup
            key={groupIndex}
            className="border-b last:border-none"
            data-oid="vbx_ydg"
          >
            <SidebarGroupContent className="gap-0" data-oid=":3j50ge">
              <SidebarMenu data-oid="4zy:t19">
                {group.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={itemIndex} data-oid="6t..j6_">
                    <Command className="w-full" data-oid="slhl2p9">
                      <div
                        className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground"
                        data-oid="19qc6gd"
                      >
                        <item.icon className="h-4 w-4" data-oid="5ck1nei" />
                        <span data-oid="321.:or">{item.label}</span>
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
