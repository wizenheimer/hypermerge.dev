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
  AlertCircleIcon,
  BugIcon,
  FileTextIcon,
  LightbulbIcon,
  ShieldIcon,
  ClockIcon,
  UsersIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  TagIcon,
  MilestoneIcon,
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

// Define the schema for Issue data
export const schema = z.object({
  id: z.number(),
  title: z.string(),
  number: z.number(),
  type: z.enum(["bug", "feature", "task", "epic", "security", "documentation"]),
  status: z.enum([
    "open",
    "in_progress",
    "review",
    "resolved",
    "closed",
    "reopened",
  ]),
  priority: z.enum(["low", "medium", "high", "critical", "blocker"]),
  source: z.enum(["jira", "github"]),
  assignee: z.string(),
  reporter: z.string(),
  labels: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_at: z.string().optional(),
  time_in_status: z.object({
    open: z.number(),
    in_progress: z.number(),
    review: z.number(),
    resolved: z.number(),
  }),
  metrics: z.object({
    first_response_time: z.number(),
    resolution_time: z.number(),
    reopen_count: z.number(),
    comment_count: z.number(),
    story_points: z.number().optional(),
    complexity: z.enum(["low", "medium", "high"]),
    impact: z.enum(["low", "medium", "high"]),
    risk_score: z.number(),
    satisfaction_score: z.number().optional(),
  }),
  linked_items: z.object({
    pr_count: z.number(),
    epic_count: z.number(),
    subtask_count: z.number(),
    blocker_count: z.number(),
  }),
});

type IssueType = z.infer<typeof schema>["type"];
type IssueStatus = z.infer<typeof schema>["status"];
type IssuePriority = z.infer<typeof schema>["priority"];

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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const issue = row.original;
      return (
        <div className="flex items-center gap-2">
          {issue.source === "github" ? (
            <GitPullRequestIcon className="size-4" />
          ) : (
            <FileTextIcon className="size-4" />
          )}
          <span className="font-medium">{issue.title}</span>
          <Badge variant="outline" className="ml-2">
            #{issue.number}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const typeConfig: Record<
        IssueType,
        { icon: typeof BugIcon; label: string; color: string }
      > = {
        bug: { icon: BugIcon, label: "Bug", color: "bg-red-100 text-red-800" },
        feature: {
          icon: LightbulbIcon,
          label: "Feature",
          color: "bg-blue-100 text-blue-800",
        },
        task: {
          icon: FileTextIcon,
          label: "Task",
          color: "bg-gray-100 text-gray-800",
        },
        epic: {
          icon: MilestoneIcon,
          label: "Epic",
          color: "bg-purple-100 text-purple-800",
        },
        security: {
          icon: ShieldIcon,
          label: "Security",
          color: "bg-orange-100 text-orange-800",
        },
        documentation: {
          icon: FileTextIcon,
          label: "Docs",
          color: "bg-green-100 text-green-800",
        },
      };
      const { icon: Icon, label, color } = typeConfig[type];
      return (
        <Badge className={`flex gap-1 ${color}`}>
          <Icon className="size-3" />
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
        IssueStatus,
        { icon: typeof CheckCircle2Icon; color: string }
      > = {
        open: { icon: FileTextIcon, color: "text-blue-500" },
        in_progress: { icon: LoaderIcon, color: "text-yellow-500" },
        review: { icon: GitPullRequestIcon, color: "text-purple-500" },
        resolved: { icon: CheckCircle2Icon, color: "text-green-500" },
        closed: { icon: CheckCircle2Icon, color: "text-gray-500" },
        reopened: { icon: AlertCircleIcon, color: "text-orange-500" },
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
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority;
      const priorityConfig: Record<IssuePriority, { color: string }> = {
        low: { color: "bg-green-100 text-green-800" },
        medium: { color: "bg-yellow-100 text-yellow-800" },
        high: { color: "bg-orange-100 text-orange-800" },
        critical: { color: "bg-red-100 text-red-800" },
        blocker: { color: "bg-red-100 text-red-800" },
      };
      const { color } = priorityConfig[priority];
      return (
        <Badge className={color}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UsersIcon className="size-4" />
        {row.original.assignee}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ClockIcon className="size-4" />
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "metrics.first_response_time",
    header: "First Response",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {formatDuration(row.original.metrics.first_response_time)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "metrics.resolution_time",
    header: "Resolution Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {formatDuration(row.original.metrics.resolution_time)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "metrics.story_points",
    header: "Story Points",
    cell: ({ row }) => {
      const points = row.original.metrics.story_points;
      return points ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{points}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "metrics.complexity",
    header: "Complexity",
    cell: ({ row }) => {
      const complexity = row.original.metrics.complexity;
      const complexityConfig: Record<
        z.infer<typeof schema>["metrics"]["complexity"],
        { color: string }
      > = {
        low: { color: "bg-green-100 text-green-800" },
        medium: { color: "bg-yellow-100 text-yellow-800" },
        high: { color: "bg-red-100 text-red-800" },
      };
      const { color } = complexityConfig[complexity];
      return (
        <Badge className={color}>
          {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "metrics.impact",
    header: "Impact",
    cell: ({ row }) => {
      const impact = row.original.metrics.impact;
      const impactConfig: Record<
        z.infer<typeof schema>["metrics"]["impact"],
        { color: string }
      > = {
        low: { color: "bg-green-100 text-green-800" },
        medium: { color: "bg-yellow-100 text-yellow-800" },
        high: { color: "bg-red-100 text-red-800" },
      };
      const { color } = impactConfig[impact];
      return (
        <Badge className={color}>
          {impact.charAt(0).toUpperCase() + impact.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "metrics.risk_score",
    header: "Risk Score",
    cell: ({ row }) => {
      const score = row.original.metrics.risk_score;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`font-medium ${
              score <= 30
                ? "text-green-600"
                : score <= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {score}
          </div>
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                score <= 30
                  ? "bg-green-500"
                  : score <= 60
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
    accessorKey: "metrics.satisfaction_score",
    header: "Satisfaction",
    cell: ({ row }) => {
      const score = row.original.metrics.satisfaction_score;
      return score ? (
        <div className="flex items-center gap-2">
          <div
            className={`font-medium ${
              score >= 80
                ? "text-green-600"
                : score >= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {score}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                score >= 80
                  ? "bg-green-500"
                  : score >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "linked_items",
    header: "Linked Items",
    cell: ({ row }) => {
      const items = row.original.linked_items;
      return (
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{items.pr_count} PRs</span>
          <span className="text-purple-600">{items.epic_count} Epics</span>
          <span className="text-green-600">{items.subtask_count} Subtasks</span>
          {items.blocker_count > 0 && (
            <span className="text-red-600">{items.blocker_count} Blockers</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "labels",
    header: "Labels",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.labels.map((label, index) => (
          <Badge key={index} variant="outline" className="flex gap-1">
            <TagIcon className="size-3" />
            {label}
          </Badge>
        ))}
      </div>
    ),
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
          <DropdownMenuItem>Edit</DropdownMenuItem>
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

export function IssuesDataTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [allData, setAllData] = React.useState<z.infer<typeof schema>[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      drag: false,
      select: false,
      title: false,
      status: false,
      linked_items: false,
      labels: false,
      "metrics.satisfaction_score": false,
      actions: false,
      type: true,
      priority: true,
      assignee: true,
      created_at: true,
      "metrics.first_response_time": true,
      "metrics.resolution_time": true,
      "metrics.story_points": true,
      "metrics.complexity": true,
      "metrics.impact": true,
      "metrics.risk_score": true,
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
      (issue) =>
        new Date(issue.created_at) >= dateLimit &&
        new Date(issue.created_at) <= now
    );

    // Sort by created date, newest first
    filteredData.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

    const issueTitles = [
      "Implement user authentication flow",
      "Fix memory leak in data processing",
      "Add dark mode support",
      "Update API documentation",
      "Improve error handling",
      "Optimize database queries",
      "Add unit tests for core functionality",
      "Implement rate limiting",
      "Update dependencies to latest versions",
      "Add monitoring and logging",
    ];

    const labels = [
      "bug",
      "enhancement",
      "documentation",
      "security",
      "performance",
      "ui/ux",
      "backend",
      "frontend",
      "api",
      "testing",
    ];

    const getRandomDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date.toISOString();
    };

    const getRandomDuration = () => {
      return Math.floor(Math.random() * 120) + 5; // 5-125 minutes
    };

    const generateIssueMetrics = () => {
      return {
        first_response_time: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        resolution_time: Math.floor(Math.random() * 480) + 60, // 60-540 minutes
        reopen_count: Math.floor(Math.random() * 3), // 0-2 reopens
        comment_count: Math.floor(Math.random() * 20), // 0-19 comments
        story_points: Math.floor(Math.random() * 8) + 1, // 1-8 story points
        complexity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as
          | "low"
          | "medium"
          | "high",
        impact: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as
          | "low"
          | "medium"
          | "high",
        risk_score: Math.floor(Math.random() * 100), // 0-100
        satisfaction_score:
          Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 60 : undefined, // 60-100 or undefined
      };
    };

    const sampleData: z.infer<typeof schema>[] = Array.from(
      { length: 50 },
      (_, i) => {
        const title =
          issueTitles[Math.floor(Math.random() * issueTitles.length)];
        const type = [
          "bug",
          "feature",
          "task",
          "epic",
          "security",
          "documentation",
        ][Math.floor(Math.random() * 6)] as IssueType;
        const status = [
          "open",
          "in_progress",
          "review",
          "resolved",
          "closed",
          "reopened",
        ][Math.floor(Math.random() * 6)] as IssueStatus;
        const priority = ["low", "medium", "high", "critical", "blocker"][
          Math.floor(Math.random() * 5)
        ] as IssuePriority;
        const source = Math.random() > 0.5 ? "jira" : "github";
        const created_at = getRandomDate(365);
        const metrics = generateIssueMetrics();
        const numLabels = Math.floor(Math.random() * 4) + 1; // 1-4 labels
        const issueLabels = [...labels]
          .sort(() => 0.5 - Math.random())
          .slice(0, numLabels);

        return {
          id: i + 1,
          title,
          number: 1000 + i,
          type,
          status,
          priority,
          source,
          assignee: teams[Math.floor(Math.random() * teams.length)],
          reporter: teams[Math.floor(Math.random() * teams.length)],
          labels: issueLabels,
          created_at,
          updated_at: getRandomDate(
            Math.min(7, new Date().getTime() - new Date(created_at).getTime())
          ),
          resolved_at:
            status === "resolved" || status === "closed"
              ? getRandomDate(7)
              : undefined,
          time_in_status: {
            open: Math.floor(Math.random() * 60) + 5,
            in_progress: Math.floor(Math.random() * 120) + 30,
            review: Math.floor(Math.random() * 60) + 15,
            resolved: Math.floor(Math.random() * 30) + 5,
          },
          metrics,
          linked_items: {
            pr_count: Math.floor(Math.random() * 3),
            epic_count: Math.floor(Math.random() * 2),
            subtask_count: Math.floor(Math.random() * 5),
            blocker_count: Math.floor(Math.random() * 2),
          },
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
      title="Issues"
      description={`Showing issues from the last ${timeRange.replace(
        /(\d+)/,
        "$1 "
      )}`}
      menuContent={menuContent}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter issues..."
              value={
                (table.getColumn("title")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
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
