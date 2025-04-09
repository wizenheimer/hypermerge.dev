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
      data-oid="9dyg0g0"
    >
      <GripVerticalIcon
        className="size-3 text-muted-foreground"
        data-oid="usjmys5"
      />
      <span className="sr-only" data-oid="en_uk6q">
        Drag to reorder
      </span>
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
    cell: ({ row }) => <DragHandle id={row.original.id} data-oid="exxld-l" />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center" data-oid="yztgpnu">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          data-oid="emkbe0r"
        />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center" data-oid="5:2wwx7">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
          data-oid="8emohe2"
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
        <div className="flex items-center gap-2" data-oid="dz76xzl">
          <CloudIcon className="size-4" data-oid="ers3ggy" />
          <span className="font-medium" data-oid="17xq:6-">
            {deployment.name}
          </span>
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
      return (
        <Badge className={color} data-oid="1y84v:i">
          {label}
        </Badge>
      );
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
        <Badge
          variant="outline"
          className={`flex gap-1 px-1.5 ${color}`}
          data-oid="q3fhd0g"
        >
          <Icon className="size-3" data-oid="h6wir03" />
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
      return (
        <Badge className={color} data-oid="iubn2mr">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="m8u4-84">
        <UsersIcon className="size-4" data-oid="d7d::g8" />
        {row.original.team}
      </div>
    ),
  },
  {
    accessorKey: "started_at",
    header: "Started",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="bv_dao4">
        <ClockIcon className="size-4" data-oid="3l.6309" />
        {new Date(row.original.started_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="vo2qwdo">
        <span className="text-muted-foreground" data-oid="baq.-.c">
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
        <div className="flex items-center gap-2" data-oid="gw580sd">
          <span className="text-blue-600" data-oid=".x.g.av">
            {changes.services} services
          </span>
          <span className="text-green-600" data-oid="uf_6m57">
            {changes.containers} containers
          </span>
          <span className="text-muted-foreground" data-oid="3j:ksa9">
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
        <div className="flex items-center gap-2" data-oid="xh8zhr-">
          <div
            className={`font-medium ${
              score >= 95
                ? "text-green-600"
                : score >= 80
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
            data-oid=":kuqody"
          >
            {score}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted" data-oid="minimce">
            <div
              className={`h-full rounded-full ${
                score >= 95
                  ? "bg-green-500"
                  : score >= 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
              data-oid="3_.r4if"
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
      <div className="flex items-center gap-2" data-oid="qsvhwtz">
        <span className="text-muted-foreground" data-oid="pqb27ru">
          {row.original.metrics.deployment_frequency}/day
        </span>
      </div>
    ),
  },
  {
    accessorKey: "metrics.lead_time",
    header: "Lead Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="ms7p7tu">
        <span className="text-muted-foreground" data-oid="edcktmf">
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
        <div className="flex items-center gap-2" data-oid="et:sgib">
          <span className="text-muted-foreground" data-oid="mdv70xz">
            {formatDuration(mttr)}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground" data-oid="vozn2_m">
          -
        </span>
      );
    },
  },
  {
    accessorKey: "metrics.change_failure_rate",
    header: "CFR",
    cell: ({ row }) => {
      const rate = row.original.metrics.change_failure_rate;
      return (
        <div className="flex items-center gap-2" data-oid=":dd:yjg">
          <div
            className={`font-medium ${
              rate <= 5
                ? "text-green-600"
                : rate <= 15
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
            data-oid="j3dubmx"
          >
            {rate}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted" data-oid="m3.1y_a">
            <div
              className={`h-full rounded-full ${
                rate <= 5
                  ? "bg-green-500"
                  : rate <= 15
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${rate}%` }}
              data-oid=".dmuf9o"
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
        <div className="flex items-center gap-2" data-oid="ddghf8t">
          <div
            className={`font-medium ${
              availability >= 99.9
                ? "text-green-600"
                : availability >= 99
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
            data-oid="5qikoui"
          >
            {formattedAvailability}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted" data-oid="ejn2_cx">
            <div
              className={`h-full rounded-full ${
                availability >= 99.9
                  ? "bg-green-500"
                  : availability >= 99
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${availability}%` }}
              data-oid="xe7muod"
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
        <div className="flex items-center gap-2" data-oid="k7xq6hr">
          <div
            className={`font-medium ${
              score >= 90
                ? "text-green-600"
                : score >= 70
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
            data-oid="fpzskev"
          >
            {score}
          </div>
          <div className="h-2 w-16 rounded-full bg-muted" data-oid="-832b.a">
            <div
              className={`h-full rounded-full ${
                score >= 90
                  ? "bg-green-500"
                  : score >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
              data-oid="269u33_"
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu data-oid="iskcvap">
        <DropdownMenuTrigger asChild data-oid="rcyzixy">
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
            data-oid=":nlo:gu"
          >
            <MoreVerticalIcon data-oid="bt4:sa_" />
            <span className="sr-only" data-oid=".9k8dzu">
              Open menu
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32" data-oid="x2ps.d-">
          <DropdownMenuItem data-oid="1::8uwf">View Details</DropdownMenuItem>
          <DropdownMenuItem data-oid="dg_6qeo">Rollback</DropdownMenuItem>
          <DropdownMenuSeparator data-oid="0yti0tb" />
          <DropdownMenuItem data-oid="vgurhjj">Delete</DropdownMenuItem>
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
      data-oid="eghoq3j"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} data-oid="pfg5sey">
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
    [],
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
    const filteredData = allData.filter(
      (deployment) =>
        new Date(deployment.started_at) >= dateLimit &&
        new Date(deployment.started_at) <= now,
    );

    // Sort by started date, newest first
    filteredData.sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
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
                  new Date(started_at).getTime() + duration * 60000,
                ).toISOString(),
          duration,
          changes: {
            services: Math.floor(Math.random() * 5) + 1,
            containers: Math.floor(Math.random() * 10) + 1,
            config_changes: Math.floor(Math.random() * 20) + 1,
          },
          metrics,
        };
      },
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
      data-oid="5-v29a3"
    />
  );

  return (
    <DashboardLayout
      title="Deployments"
      description={`Showing deployments from the last ${timeRange.replace(
        /(\d+)/,
        "$1 ",
      )}`}
      menuContent={menuContent}
      data-oid="e2:bw3l"
    >
      <div className="flex flex-col gap-4" data-oid="j7ex-gt">
        <div className="flex items-center justify-between" data-oid="gv2abw7">
          <div className="flex items-center gap-2" data-oid="vhkkqdm">
            <Input
              placeholder="Filter deployments..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
              data-oid="n9nbvbd"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border" data-oid="g_97-_2">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
            data-oid="4sif0v4"
          >
            <Table data-oid=".j.1n:o">
              <TableHeader
                className="sticky top-0 z-10 bg-muted"
                data-oid="vl5bmt7"
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} data-oid="7nmsrvf">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          data-oid="2vjqnkc"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody data-oid="sj.z9qa">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                    data-oid="h86:x20"
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} data-oid="5awvy_3" />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow data-oid="ae:cf6c">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                      data-oid="n9bdfth"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between" data-oid="k_8qcv5">
          <div className="text-sm text-muted-foreground" data-oid="el3sk9j">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2" data-oid="s42noaf">
            <div className="flex items-center gap-2" data-oid="d01_mot">
              <Label
                htmlFor="rows-per-page"
                className="text-sm font-medium"
                data-oid="sd0vm6m"
              >
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value: string) => {
                  table.setPageSize(Number(value));
                }}
                data-oid="ix2t.vv"
              >
                <SelectTrigger
                  className="w-20"
                  id="rows-per-page"
                  data-oid="5pqq1b:"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                    data-oid="c8awy9j"
                  />
                </SelectTrigger>
                <SelectContent side="top" data-oid="de.h28t">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      data-oid="hwwiky1"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2" data-oid="lpxkomg">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                data-oid="jy616-e"
              >
                <span className="sr-only" data-oid="g-uzj-p">
                  Go to first page
                </span>
                <ChevronsLeftIcon className="size-4" data-oid="5bqs771" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                data-oid="af88x:g"
              >
                <span className="sr-only" data-oid="06pnz5t">
                  Go to previous page
                </span>
                <ChevronLeftIcon className="size-4" data-oid="nfhlfmf" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                data-oid="4k10lvh"
              >
                <span className="sr-only" data-oid="ngvd04-">
                  Go to next page
                </span>
                <ChevronRightIcon className="size-4" data-oid="f52awfh" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                data-oid="lc25p2c"
              >
                <span className="sr-only" data-oid="y6-y5na">
                  Go to last page
                </span>
                <ChevronsRightIcon className="size-4" data-oid="6rfi_bx" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
