"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  UsersIcon,
  TrendingUpIcon,
  TimerIcon,
  CodeIcon,
  BarChart3Icon,
  GitPullRequestIcon,
  AlertTriangleIcon,
  ThumbsUpIcon,
  ClockIcon,
  ActivityIcon,
  ZapIcon,
  ScaleIcon,
  ShieldIcon,
} from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Menu from "@/components/menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useDashboardState, TimeRange } from "@/hooks/useDashboardState";

// Define the schema for Team Goals data
export const schema = z.object({
  id: z.number(),
  team_name: z.string(),
  period: z.string(),
  productivity: z.object({
    velocity: z.number(),
    lead_time: z.number(),
    cycle_time: z.number(),
    throughput: z.number(),
  }),
  code_quality: z.object({
    code_coverage: z.number(),
    bug_rate: z.number(),
    tech_debt_ratio: z.number(),
    test_pass_rate: z.number(),
  }),
  review_metrics: z.object({
    avg_review_time: z.number(),
    reviewers_per_pr: z.number(),
    review_coverage: z.number(),
    approval_rate: z.number(),
    first_pass_success: z.number(),
    review_iterations: z.number(),
  }),
  pr_metrics: z.object({
    avg_pr_size: z.number(),
    time_to_first_review: z.number(),
    pickup_time: z.number(),
    stale_pr_rate: z.number(),
    closed_without_merge_rate: z.number(),
    merge_time: z.number(),
    high_risk_pr_rate: z.number(),
  }),
  goals: z.object({
    velocity_goal: z.number(),
    quality_goal: z.number(),
    review_time_goal: z.number(),
    coverage_goal: z.number(),
  }),
  status: z.enum(["on_track", "at_risk", "off_track"]),
  trend: z.enum(["improving", "stable", "declining"]),
});

type TeamStatus = z.infer<typeof schema>["status"];
type TeamTrend = z.infer<typeof schema>["trend"];

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
      data-oid="gt6egb_"
    >
      <GripVerticalIcon
        className="size-3 text-muted-foreground"
        data-oid="1zqv:xp"
      />
      <span className="sr-only" data-oid="4uz_ufe">
        Drag to reorder
      </span>
    </Button>
  );
}

// Helper function to format percentages
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

// Helper function to format time durations
const formatDuration = (hours: number) => {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// Helper function to format metrics with progress bars
const MetricWithProgress = ({
  value,
  goal,
  label,
  isInverse = false,
}: {
  value: number;
  goal: number;
  label: string;
  isInverse?: boolean;
}) => {
  const percentage = (value / goal) * 100;
  const isGood = isInverse ? value <= goal : value >= goal;

  return (
    <div className="flex items-center gap-2" data-oid="_ptu-iu">
      <div className="min-w-[60px] text-sm font-medium" data-oid="g_152nb">
        {label === "time" ? formatDuration(value) : formatPercent(value)}
      </div>
      <div className="h-2 w-16 rounded-full bg-muted" data-oid="w7awi2l">
        <div
          className={`h-full rounded-full ${
            isGood ? "bg-green-500" : "bg-red-500"
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
          data-oid="l.fub48"
        />
      </div>
    </div>
  );
};

// Add columns definition
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    enableHiding: false,
    cell: ({ row }) => <DragHandle id={row.original.id} data-oid="4.6qsi:" />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center" data-oid="2-y0t.m">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          data-oid="82f:vfi"
        />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center" data-oid="qaf6_.1">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
          data-oid="p.c4myw"
        />
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "team_name",
    header: "Team",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="p8l3r_6">
        <UsersIcon className="size-4" data-oid="jmyxphl" />
        <span className="font-medium" data-oid="mc5_dg.">
          {row.original.team_name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<
        TeamStatus,
        { icon: typeof CheckCircle2Icon; color: string; label: string }
      > = {
        on_track: {
          icon: CheckCircle2Icon,
          color: "text-green-500",
          label: "On Track",
        },
        at_risk: {
          icon: AlertTriangleIcon,
          color: "text-yellow-500",
          label: "At Risk",
        },
        off_track: {
          icon: AlertTriangleIcon,
          color: "text-red-500",
          label: "Off Track",
        },
      };
      const { icon: Icon, color, label } = statusConfig[status];
      return (
        <Badge
          variant="outline"
          className={`flex gap-1 px-1.5 ${color}`}
          data-oid="86w8h3p"
        >
          <Icon className="size-3" data-oid="i.i-vy7" />
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "trend",
    header: "Trend",
    cell: ({ row }) => {
      const trend = row.original.trend;
      const trendConfig: Record<
        TeamTrend,
        { icon: typeof TrendingUpIcon; color: string }
      > = {
        improving: { icon: TrendingUpIcon, color: "text-green-500" },
        stable: { icon: ScaleIcon, color: "text-blue-500" },
        declining: { icon: TrendingUpIcon, color: "text-red-500" },
      };
      const { icon: Icon, color } = trendConfig[trend];
      return (
        <div className={`flex items-center gap-1 ${color}`} data-oid="i-c1x1u">
          <Icon
            className={`size-4 ${trend === "declining" ? "rotate-180" : ""}`}
            data-oid="yimv6bd"
          />

          <span className="capitalize" data-oid="hvd9-l8">
            {trend}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "productivity.velocity",
    header: "Velocity",
    cell: ({ row }) => (
      <MetricWithProgress
        value={row.original.productivity.velocity}
        goal={row.original.goals.velocity_goal}
        label="points"
        data-oid="-5dgu30"
      />
    ),
  },
  {
    accessorKey: "productivity.lead_time",
    header: "Lead Time",
    cell: ({ row }) => (
      <MetricWithProgress
        value={row.original.productivity.lead_time}
        goal={24}
        label="time"
        isInverse={true}
        data-oid="cgg:bae"
      />
    ),
  },
  {
    accessorKey: "code_quality.code_coverage",
    header: "Code Coverage",
    cell: ({ row }) => (
      <MetricWithProgress
        value={row.original.code_quality.code_coverage}
        goal={row.original.goals.quality_goal}
        label="percent"
        data-oid="hbpt0so"
      />
    ),
  },
  {
    accessorKey: "review_metrics.avg_review_time",
    header: "Review Time",
    cell: ({ row }) => (
      <MetricWithProgress
        value={row.original.review_metrics.avg_review_time}
        goal={row.original.goals.review_time_goal}
        label="time"
        isInverse={true}
        data-oid="gs:sc82"
      />
    ),
  },
  {
    accessorKey: "review_metrics.review_coverage",
    header: "Review Coverage",
    cell: ({ row }) => (
      <MetricWithProgress
        value={row.original.review_metrics.review_coverage}
        goal={row.original.goals.coverage_goal}
        label="percent"
        data-oid="zhws33x"
      />
    ),
  },
  {
    accessorKey: "pr_metrics.avg_pr_size",
    header: "Avg PR Size",
    cell: ({ row }) => {
      const size = row.original.pr_metrics.avg_pr_size;
      return (
        <div className="flex items-center gap-2" data-oid="_2bbh93">
          <span className="text-muted-foreground" data-oid="oif2e86">
            {size} lines
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "pr_metrics.high_risk_pr_rate",
    header: "High Risk PRs",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="fizeu9i">
        <span
          className={`font-medium ${
            row.original.pr_metrics.high_risk_pr_rate > 20
              ? "text-red-600"
              : "text-green-600"
          }`}
          data-oid="3fhr3v4"
        >
          {formatPercent(row.original.pr_metrics.high_risk_pr_rate)}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu data-oid="x8qu5el">
        <DropdownMenuTrigger asChild data-oid="f3up50l">
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
            data-oid=".b:b8d3"
          >
            <MoreVerticalIcon data-oid="56jicr1" />
            <span className="sr-only" data-oid="bpthzrw">
              Open menu
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32" data-oid="sv0orad">
          <DropdownMenuItem data-oid="1:-xnxi">View Details</DropdownMenuItem>
          <DropdownMenuItem data-oid="n.tg21y">Edit Goals</DropdownMenuItem>
          <DropdownMenuSeparator data-oid="xz3_w_g" />
          <DropdownMenuItem data-oid="o3xb.57">Export Data</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      data-oid="ltsqrbz"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} data-oid="w5skqfv">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function TeamGoalsDataTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [allData, setAllData] = React.useState<z.infer<typeof schema>[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      drag: false,
      select: false,
      actions: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [timeRange, setTimeRange] = React.useState<TimeRange>("1month");

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  // Filter data based on time range
  React.useEffect(() => {
    if (!allData.length) return;

    const now = new Date();
    const getDateLimit = () => {
      const date = new Date();
      switch (timeRange) {
        case "1week":
          date.setDate(date.getDate() - 7);
          break;
        case "15days":
          date.setDate(date.getDate() - 15);
          break;
        case "1month":
          date.setMonth(date.getMonth() - 1);
          break;
        case "3month":
          date.setMonth(date.getMonth() - 3);
          break;
        case "6month":
          date.setMonth(date.getMonth() - 6);
          break;
        case "1year":
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      return date;
    };

    const dateLimit = getDateLimit();
    setData(allData);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [timeRange, allData]);

  // Generate sample data
  React.useEffect(() => {
    const teams = [
      "Frontend Team",
      "Backend Team",
      "DevOps Team",
      "Mobile Team",
      "Data Team",
      "Platform Team",
    ];

    const generateTeamMetrics = (teamName: string) => {
      // Base metrics that vary by team type
      const teamMetricsBase = {
        Frontend: {
          velocity: { min: 25, max: 45 },
          pr_size: { min: 100, max: 300 },
          coverage: { min: 75, max: 90 },
        },
        Backend: {
          velocity: { min: 20, max: 40 },
          pr_size: { min: 150, max: 400 },
          coverage: { min: 85, max: 95 },
        },
        DevOps: {
          velocity: { min: 15, max: 30 },
          pr_size: { min: 50, max: 200 },
          coverage: { min: 70, max: 85 },
        },
        Mobile: {
          velocity: { min: 20, max: 35 },
          pr_size: { min: 120, max: 350 },
          coverage: { min: 70, max: 85 },
        },
        Data: {
          velocity: { min: 15, max: 35 },
          pr_size: { min: 80, max: 250 },
          coverage: { min: 80, max: 90 },
        },
        Platform: {
          velocity: { min: 18, max: 38 },
          pr_size: { min: 100, max: 300 },
          coverage: { min: 80, max: 92 },
        },
      };

      // Get team type from team name
      const teamType = teamName.split(" ")[0];
      const baseMetrics =
        teamMetricsBase[teamType as keyof typeof teamMetricsBase];

      // Helper function for random number in range
      const randomInRange = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      return {
        productivity: {
          velocity: randomInRange(
            baseMetrics.velocity.min,
            baseMetrics.velocity.max,
          ),
          lead_time: randomInRange(24, 72), // 1-3 days
          cycle_time: randomInRange(16, 48), // 16-48 hours
          throughput: randomInRange(3, 8), // PRs per day
        },
        code_quality: {
          code_coverage: randomInRange(
            baseMetrics.coverage.min,
            baseMetrics.coverage.max,
          ),
          bug_rate: randomInRange(1, 4) / 10, // 0.1-0.4 bugs per PR
          tech_debt_ratio: randomInRange(8, 18), // 8-18%
          test_pass_rate: randomInRange(95, 100), // 95-100%
        },
        review_metrics: {
          avg_review_time: randomInRange(2, 8), // 2-8 hours
          reviewers_per_pr: randomInRange(2, 4),
          review_coverage: randomInRange(90, 100), // 90-100%
          approval_rate: randomInRange(85, 98), // 85-98%
          first_pass_success: randomInRange(65, 85), // 65-85%
          review_iterations: randomInRange(1, 3),
        },
        pr_metrics: {
          avg_pr_size: randomInRange(
            baseMetrics.pr_size.min,
            baseMetrics.pr_size.max,
          ),
          time_to_first_review: randomInRange(1, 4), // 1-4 hours
          pickup_time: randomInRange(1, 3), // 1-3 hours
          stale_pr_rate: randomInRange(3, 8), // 3-8%
          closed_without_merge_rate: randomInRange(2, 6), // 2-6%
          merge_time: randomInRange(4, 12), // 4-12 hours
          high_risk_pr_rate: randomInRange(5, 15), // 5-15%
        },
        goals: {
          velocity_goal: baseMetrics.velocity.max,
          quality_goal: Math.max(baseMetrics.coverage.max, 90),
          review_time_goal: 8, // 8 hours
          coverage_goal: 95, // 95%
        },
      };
    };

    const sampleData: z.infer<typeof schema>[] = teams.map((team, index) => {
      const metrics = generateTeamMetrics(team);

      // Calculate status based on actual metrics vs goals
      const getStatus = () => {
        const velocityRatio =
          metrics.productivity.velocity / metrics.goals.velocity_goal;
        const qualityRatio =
          metrics.code_quality.code_coverage / metrics.goals.quality_goal;
        const reviewRatio =
          metrics.review_metrics.avg_review_time /
          metrics.goals.review_time_goal;
        const coverageRatio =
          metrics.review_metrics.review_coverage / metrics.goals.coverage_goal;

        const score =
          (velocityRatio + qualityRatio + (1 - reviewRatio) + coverageRatio) /
          4;

        if (score >= 0.9) return "on_track";
        if (score >= 0.75) return "at_risk";
        return "off_track";
      };

      // Calculate trend based on historical performance (simulated)
      const getTrend = () => {
        const score = Math.random(); // In real app, would compare with historical data
        if (score > 0.6) return "improving";
        if (score > 0.3) return "stable";
        return "declining";
      };

      return {
        id: index + 1,
        team_name: team,
        period: "2024-Q1",
        ...metrics,
        status: getStatus() as TeamStatus,
        trend: getTrend() as TeamTrend,
      };
    });

    setAllData(sampleData);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  // Menu configuration
  const menuContent = (
    <Menu
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      timeRangeLabels={{
        "1week": "1 Week",
        "15days": "15 Days",
        "1month": "1 Month",
        "3month": "3 Months",
        "6month": "6 Months",
        "1year": "1 Year",
      }}
      showViewTypeSelector={false}
      showTimeRangeSelector={true}
      showColumnSelector={true}
      columns={table
        .getAllColumns()
        .filter((column) => column.id !== "select" && column.id !== "drag")}
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      data-oid="5.eo0_e"
    />
  );

  return (
    <DashboardLayout
      title="Team Goals & Metrics"
      description={`Showing team performance metrics for ${timeRange.replace(
        /(\d+)/,
        "$1 "
      )}`}
      menuContent={menuContent}
      data-oid="fvfmvit"
    >
      <div className="flex flex-col gap-4 w-full" data-oid="_mv68tb">
        <div className="flex items-center justify-between" data-oid="4-fe1l8">
          <div className="flex items-center gap-2" data-oid="zzxfqkt">
            <Input
              placeholder="Filter teams..."
              value={
                (table.getColumn("team_name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("team_name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
              data-oid="_1vle5r"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border" data-oid="tp:rydp">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
            data-oid="r8cmiq0"
          >
            <Table data-oid="5qe.7s-">
              <TableHeader
                className="sticky top-0 z-10 bg-muted"
                data-oid="uc68x.j"
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} data-oid="6ael:lr">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          data-oid="_s97mz:"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody data-oid="7s_cupd">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                    data-oid="7gnk57j"
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} data-oid="88frm9p" />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow data-oid=":-u53aj">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                      data-oid="j2s-m26"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between" data-oid="s1fahb3">
          <div className="text-sm text-muted-foreground" data-oid="o.ckmxc">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2" data-oid="1gl12gh">
            <div className="flex items-center gap-2" data-oid="90u0y4p">
              <Label
                htmlFor="rows-per-page"
                className="text-sm font-medium"
                data-oid="-f85ct5"
              >
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value: string) => {
                  table.setPageSize(Number(value));
                }}
                data-oid="sodjg7q"
              >
                <SelectTrigger
                  className="w-20"
                  id="rows-per-page"
                  data-oid="fuox70b"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                    data-oid="tyyizhd"
                  />
                </SelectTrigger>
                <SelectContent side="top" data-oid="pqqrjbv">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      data-oid="37ggaiy"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2" data-oid="zalgaku">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                data-oid="s4lx7oa"
              >
                <span className="sr-only" data-oid="2lb8g9b">
                  Go to first page
                </span>
                <ChevronsLeftIcon className="size-4" data-oid="fhze33_" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                data-oid="2.f0h4p"
              >
                <span className="sr-only" data-oid="8ohqzbh">
                  Go to previous page
                </span>
                <ChevronLeftIcon className="size-4" data-oid="by_.162" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                data-oid="itv_36y"
              >
                <span className="sr-only" data-oid="8ta3c12">
                  Go to next page
                </span>
                <ChevronRightIcon className="size-4" data-oid="ft4_hn-" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                data-oid="7enuuad"
              >
                <span className="sr-only" data-oid="6za2fsf">
                  Go to last page
                </span>
                <ChevronsRightIcon className="size-4" data-oid="7f1q0u." />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
