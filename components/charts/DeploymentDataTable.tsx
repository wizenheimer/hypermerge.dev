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
  CloudIcon,
  ServerIcon,
  ClockIcon,
  UsersIcon,
  AlertCircleIcon,
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

// Define the schema for Deployment data
export const schema = z.object({
  id: z.number(),
  name: z.string(),
  environment: z.enum(["production", "staging", "development", "testing"]),
  status: z.enum(["success", "failed", "in_progress", "rolled_back"]),
  type: z.enum([
    "full_deploy",
    "rollback",
    "hotfix",
    "feature",
    "maintenance",
    "security",
  ]),
  team: z.string(),
  started_at: z.string(),
  completed_at: z.string().optional(),
  duration: z.number(),
  changes: z.object({
    services: z.number(),
    containers: z.number(),
    config_changes: z.number(),
  }),
  metrics: z.object({
    success_rate: z.number(),
    deployment_frequency: z.number(),
    lead_time: z.number(),
    mean_time_to_recovery: z.number().optional(),
    change_failure_rate: z.number(),
    availability: z.number(),
    performance_score: z.number(),
  }),
});

type DeploymentStatus = z.infer<typeof schema>["status"];
type DeploymentType = z.infer<typeof schema>["type"];

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
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Add helper functions for time calculations and formatting
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

// Add new columns to the existing columns array
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    enableHiding: false,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const deployment = row.original;
      return (
        <div className="flex items-center gap-2">
          <CloudIcon className="size-4" />
          <span className="font-medium">{deployment.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "environment",
    header: "Environment",
    cell: ({ row }) => {
      const env = row.original.environment;
      const envConfig: Record<
        z.infer<typeof schema>["environment"],
        { label: string; color: string }
      > = {
        production: { label: "Production", color: "bg-red-100 text-red-800" },
        staging: { label: "Staging", color: "bg-yellow-100 text-yellow-800" },
        development: {
          label: "Development",
          color: "bg-blue-100 text-blue-800",
        },
        testing: { label: "Testing", color: "bg-green-100 text-green-800" },
      };
      const { label, color } = envConfig[env];
      return <Badge className={color}>{label}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<
        DeploymentStatus,
        { icon: typeof CheckCircle2Icon; color: string }
      > = {
        success: { icon: CheckCircle2Icon, color: "text-green-500" },
        failed: { icon: AlertCircleIcon, color: "text-red-500" },
        in_progress: { icon: LoaderIcon, color: "text-blue-500" },
        rolled_back: { icon: ServerIcon, color: "text-orange-500" },
      };
      const { icon: Icon, color } = statusConfig[status];
      return (
        <Badge variant="outline" className={`flex gap-1 px-1.5 ${color}`}>
          <Icon className="size-3" />
          {status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const typeConfig: Record<
        DeploymentType,
        { label: string; color: string }
      > = {
        full_deploy: {
          label: "Full Deploy",
          color: "bg-blue-100 text-blue-800",
        },
        rollback: { label: "Rollback", color: "bg-orange-100 text-orange-800" },
        hotfix: { label: "Hotfix", color: "bg-red-100 text-red-800" },
        feature: { label: "Feature", color: "bg-green-100 text-green-800" },
        maintenance: {
          label: "Maintenance",
          color: "bg-purple-100 text-purple-800",
        },
        security: { label: "Security", color: "bg-yellow-100 text-yellow-800" },
      };
      const { label, color } = typeConfig[type];
      return <Badge className={color}>{label}</Badge>;
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UsersIcon className="size-4" />
        {row.original.team}
      </div>
    ),
  },
  {
    accessorKey: "started_at",
    header: "Started",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ClockIcon className="size-4" />
        {new Date(row.original.started_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {formatDuration(row.original.duration)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "changes",
    header: "Changes",
    cell: ({ row }) => {
      const changes = row.original.changes;
      return (
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{changes.services} services</span>
          <span className="text-green-600">
            {changes.containers} containers
          </span>
          <span className="text-muted-foreground">
            {changes.config_changes} configs
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.success_rate",
    header: "Success Rate",
    cell: ({ row }) => {
      const score = row.original.metrics.success_rate;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`font-medium ${
              score >= 95
                ? "text-green-600"
                : score >= 80
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {score}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                score >= 95
                  ? "bg-green-500"
                  : score >= 80
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.deployment_frequency",
    header: "Deployment Frequency",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {row.original.metrics.deployment_frequency}/day
        </span>
      </div>
    ),
  },
  {
    accessorKey: "metrics.lead_time",
    header: "Lead Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {formatDuration(row.original.metrics.lead_time)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "metrics.mean_time_to_recovery",
    header: "MTTR",
    cell: ({ row }) => {
      const mttr = row.original.metrics.mean_time_to_recovery;
      return mttr ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{formatDuration(mttr)}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "metrics.change_failure_rate",
    header: "CFR",
    cell: ({ row }) => {
      const rate = row.original.metrics.change_failure_rate;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`font-medium ${
              rate <= 5
                ? "text-green-600"
                : rate <= 15
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {rate}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                rate <= 5
                  ? "bg-green-500"
                  : rate <= 15
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.availability",
    header: "Availability",
    cell: ({ row }) => {
      const availability = row.original.metrics.availability;
      const formattedAvailability = availability.toFixed(3);
      return (
        <div className="flex items-center gap-2">
          <div
            className={`font-medium ${
              availability >= 99.9
                ? "text-green-600"
                : availability >= 99
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {formattedAvailability}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                availability >= 99.9
                  ? "bg-green-500"
                  : availability >= 99
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${availability}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.performance_score",
    header: "Performance",
    cell: ({ row }) => {
      const score = row.original.metrics.performance_score;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`font-medium ${
              score >= 90
                ? "text-green-600"
                : score >= 70
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {score}
          </div>
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                score >= 90
                  ? "bg-green-500"
                  : score >= 70
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Rollback</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
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
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DeploymentDataTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [allData, setAllData] = React.useState<z.infer<typeof schema>[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      drag: false,
      select: false,
      name: false,
      status: false,
      changes: false,
      "metrics.deployment_frequency": false,
      "metrics.lead_time": false,
      "metrics.mean_time_to_recovery": false,
      "metrics.change_failure_rate": false,
      "metrics.availability": false,
      "metrics.performance_score": false,
      actions: false,
      environment: true,
      type: true,
      team: true,
      started_at: true,
      duration: true,
      "metrics.success_rate": true,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [timeRange, setTimeRange] = React.useState<TimeRange>("1year");

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
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
    const filteredData = allData.filter(
      (deployment) =>
        new Date(deployment.started_at) >= dateLimit &&
        new Date(deployment.started_at) <= now
    );

    // Sort by started date, newest first
    filteredData.sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    setData(filteredData);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [timeRange, allData]);

  // Generate sample data
  React.useEffect(() => {
    const teams = [
      "Frontend Team",
      "Backend Team",
      "DevOps Team",
      "QA Team",
      "Security Team",
      "Infrastructure Team",
    ];

    const deploymentNames = [
      "v1.2.3 Release",
      "Security Patch",
      "Performance Optimization",
      "Database Migration",
      "API Gateway Update",
      "Service Mesh Upgrade",
      "Monitoring Enhancement",
      "Logging System Update",
      "Cache System Upgrade",
      "Load Balancer Configuration",
    ];

    const getRandomDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date.toISOString();
    };

    const getRandomDuration = () => {
      return Math.floor(Math.random() * 120) + 5; // 5-125 minutes
    };

    const generateDeploymentMetrics = () => {
      return {
        success_rate: Math.floor(Math.random() * 20) + 80, // 80-100%
        deployment_frequency: (Math.random() * 5).toFixed(1), // 0-5 per day
        lead_time: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        mean_time_to_recovery: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
        change_failure_rate: Math.floor(Math.random() * 15), // 0-15%
        availability: 99 + Math.random(), // 99-100%
        performance_score: Math.floor(Math.random() * 30) + 70, // 70-100
      };
    };

    const sampleData: z.infer<typeof schema>[] = Array.from(
      { length: 50 },
      (_, i) => {
        const name =
          deploymentNames[Math.floor(Math.random() * deploymentNames.length)];
        const environment = ["production", "staging", "development", "testing"][
          Math.floor(Math.random() * 4)
        ] as z.infer<typeof schema>["environment"];
        const status = ["success", "failed", "in_progress", "rolled_back"][
          Math.floor(Math.random() * 4)
        ] as DeploymentStatus;
        const type = [
          "full_deploy",
          "rollback",
          "hotfix",
          "feature",
          "maintenance",
          "security",
        ][Math.floor(Math.random() * 6)] as DeploymentType;
        const started_at = getRandomDate(365);
        const duration = getRandomDuration();
        const metrics = generateDeploymentMetrics();

        return {
          id: i + 1,
          name,
          environment,
          status,
          type,
          team: teams[Math.floor(Math.random() * teams.length)],
          started_at,
          completed_at:
            status === "in_progress"
              ? undefined
              : new Date(
                  new Date(started_at).getTime() + duration * 60000
                ).toISOString(),
          duration,
          changes: {
            services: Math.floor(Math.random() * 5) + 1,
            containers: Math.floor(Math.random() * 10) + 1,
            config_changes: Math.floor(Math.random() * 20) + 1,
          },
          metrics,
        };
      }
    );

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
    />
  );

  return (
    <DashboardLayout
      title="Deployments"
      description={`Showing deployments from the last ${timeRange.replace(
        /(\d+)/,
        "$1 "
      )}`}
      menuContent={menuContent}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter deployments..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value: string) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
