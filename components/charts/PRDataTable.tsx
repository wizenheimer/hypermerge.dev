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
  GitPullRequestIcon,
  GitMergeIcon,
  GitBranchIcon,
  ClockIcon,
  UsersIcon,
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

// Define the schema for PR data
export const schema = z.object({
  id: z.number(),
  title: z.string(),
  number: z.number(),
  author: z.string(),
  status: z.enum(["open", "closed", "merged"]),
  focus: z.enum([
    "feature",
    "bug",
    "chore",
    "documentation",
    "enhancement",
    "security",
  ]),
  reviewers: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  merge_time: z.string().optional(),
  first_review_at: z.string().optional(),
  review_started_at: z.string().optional(),
  comments: z.number(),
  changes: z.object({
    additions: z.number(),
    deletions: z.number(),
    files: z.number(),
  }),
  metrics: z.object({
    cycle_time: z.number(), // Total time from creation to merge (hours)
    time_to_first_review: z.number().optional(), // Time from creation to first review (hours)
    coding_time: z.number(), // Time spent in coding phase (hours)
    pickup_time: z.number().optional(), // Time until first reviewer picked up (hours)
    review_time: z.number().optional(), // Time spent in review (hours)
    merge_time_duration: z.number().optional(), // Time to merge after approval (hours)
    code_quality_score: z.number(), // 0-100 score based on various factors
    risk_rate: z.number(), // 0-100 score indicating risk level
  }),
});

type PRStatus = z.infer<typeof schema>["status"];
type PRFocus = z.infer<typeof schema>["focus"];

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
      data-oid="bzf.ae0"
    >
      <GripVerticalIcon
        className="size-3 text-muted-foreground"
        data-oid="q.vv:tc"
      />
      <span className="sr-only" data-oid="1:cgt6:">
        Drag to reorder
      </span>
    </Button>
  );
}

// Add helper functions for time calculations and formatting
const calculateHoursBetween = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(diff / (1000 * 60 * 60));
};

const formatDuration = (hours: number) => {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// Add new columns to the existing columns array
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    enableHiding: false,
    cell: ({ row }) => <DragHandle id={row.original.id} data-oid="jj7::ft" />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center" data-oid="wygc99h">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          data-oid="ql2arws"
        />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center" data-oid="wdlc2ym">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
          data-oid="5kqxjyn"
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
      const pr = row.original;
      return (
        <div className="flex items-center gap-2" data-oid="a2gddcj">
          <GitPullRequestIcon className="size-4" data-oid="0a92k8k" />
          <span className="font-medium" data-oid="43wxvfx">
            {pr.title}
          </span>
          <Badge variant="outline" className="ml-2" data-oid="x3zoeo:">
            #{pr.number}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<
        PRStatus,
        { icon: typeof GitPullRequestIcon; color: string }
      > = {
        open: { icon: GitPullRequestIcon, color: "text-blue-500" },
        closed: { icon: GitBranchIcon, color: "text-red-500" },
        merged: { icon: GitMergeIcon, color: "text-purple-500" },
      };
      const { icon: Icon, color } = statusConfig[status];
      return (
        <Badge
          variant="outline"
          className={`flex gap-1 px-1.5 ${color}`}
          data-oid="l4y68b_"
        >
          <Icon className="size-3" data-oid="kek:1cs" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "focus",
    header: "Focus",
    cell: ({ row }) => {
      const focus = row.original.focus;
      const focusConfig: Record<PRFocus, { label: string; color: string }> = {
        feature: { label: "Feature", color: "bg-blue-100 text-blue-800" },
        bug: { label: "Bug", color: "bg-red-100 text-red-800" },
        chore: { label: "Chore", color: "bg-gray-100 text-gray-800" },
        documentation: { label: "Docs", color: "bg-green-100 text-green-800" },
        enhancement: {
          label: "Enhancement",
          color: "bg-purple-100 text-purple-800",
        },
        security: { label: "Security", color: "bg-orange-100 text-orange-800" },
      };
      const { label, color } = focusConfig[focus];
      return (
        <Badge className={color} data-oid="lw0q8p0">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid=".u2c83z">
        <UsersIcon className="size-4" data-oid="9xmqr:x" />
        {row.original.author}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="5x95xed">
        <ClockIcon className="size-4" data-oid="fwlvw3y" />
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "changes",
    header: "Changes",
    cell: ({ row }) => {
      const changes = row.original.changes;
      return (
        <div className="flex items-center gap-2" data-oid=":19fy2k">
          <span className="text-green-600" data-oid="_n2rjgl">
            +{changes.additions}
          </span>
          <span className="text-red-600" data-oid="6ur52zm">
            -{changes.deletions}
          </span>
          <span className="text-muted-foreground" data-oid="7btvfjr">
            {changes.files} files
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" data-oid="gg0afsn">
        <span className="text-muted-foreground" data-oid="cw0kk9o">
          {row.original.comments}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "reviewers",
    header: "Reviewers",
    cell: ({ row }) => {
      const reviewers = row.original.reviewers;
      const totalReviewers = reviewers.length;

      return (
        <div className="flex items-center gap-2" data-oid="zl:ptbg">
          <div className="flex -space-x-2" data-oid="45kox2i">
            {reviewers.slice(0, 2).map((reviewer, index) => (
              <div
                key={index}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium"
                title={reviewer}
                data-oid="da:_r4k"
              >
                {reviewer
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </div>
            ))}
            {totalReviewers > 2 && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium"
                data-oid="n:kcvuz"
              >
                +{totalReviewers - 2}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.cycle_time",
    header: "Cycle Time",
    cell: ({ row }) => {
      const cycleTime = row.original.metrics.cycle_time;
      return (
        <div className="flex items-center gap-2" data-oid="b2:kk5e">
          <span className="text-muted-foreground" data-oid="eeghzhm">
            {formatDuration(cycleTime)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.time_to_first_review",
    header: "Time to Review",
    cell: ({ row }) => {
      const timeToReview = row.original.metrics.time_to_first_review;
      return timeToReview ? (
        <div className="flex items-center gap-2" data-oid="ru52lpq">
          <span className="text-muted-foreground" data-oid="ab6yd8z">
            {formatDuration(timeToReview)}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground" data-oid="z43cw-w">
          -
        </span>
      );
    },
  },
  {
    accessorKey: "metrics.coding_time",
    header: "Coding Time",
    cell: ({ row }) => {
      const codingTime = row.original.metrics.coding_time;
      return (
        <div className="flex items-center gap-2" data-oid="jqg2-k6">
          <span className="text-muted-foreground" data-oid="0wr65a2">
            {formatDuration(codingTime)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.pickup_time",
    header: "Pickup Time",
    cell: ({ row }) => {
      const pickupTime = row.original.metrics.pickup_time;
      return pickupTime ? (
        <div className="flex items-center gap-2" data-oid="u0m8-y-">
          <span className="text-muted-foreground" data-oid="fnge59k">
            {formatDuration(pickupTime)}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground" data-oid="6sooe9p">
          -
        </span>
      );
    },
  },
  {
    accessorKey: "metrics.review_time",
    header: "Review Time",
    cell: ({ row }) => {
      const reviewTime = row.original.metrics.review_time;
      return reviewTime ? (
        <div className="flex items-center gap-2" data-oid="-mzvr.x">
          <span className="text-muted-foreground" data-oid="4wag9ke">
            {formatDuration(reviewTime)}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground" data-oid="azh:ozz">
          -
        </span>
      );
    },
  },
  {
    accessorKey: "metrics.merge_time_duration",
    header: "Merge Time",
    cell: ({ row }) => {
      const mergeTime = row.original.metrics.merge_time_duration;
      return mergeTime ? (
        <div className="flex items-center gap-2" data-oid="s9juv:7">
          <span className="text-muted-foreground" data-oid="pwi5.qp">
            {formatDuration(mergeTime)}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground" data-oid="8rd58xq">
          -
        </span>
      );
    },
  },
  {
    accessorKey: "metrics.code_quality_score",
    header: "Code Quality",
    cell: ({ row }) => {
      const score = row.original.metrics.code_quality_score;
      const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
      };

      return (
        <div className="flex items-center gap-2" data-oid="w35x9.o">
          <div
            className={`font-medium ${getScoreColor(score)}`}
            data-oid="_h.r_.5"
          >
            {score}
          </div>
          <div className="h-2 w-16 rounded-full bg-muted" data-oid="xu1u3a7">
            <div
              className={`h-full rounded-full ${
                score >= 80
                  ? "bg-green-500"
                  : score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
              data-oid="1o8scbo"
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "metrics.risk_rate",
    header: "Risk Rate",
    cell: ({ row }) => {
      const risk = row.original.metrics.risk_rate;
      const getRiskColor = (risk: number) => {
        if (risk <= 30) return "text-green-600";
        if (risk <= 60) return "text-yellow-600";
        return "text-red-600";
      };

      return (
        <div className="flex items-center gap-2" data-oid="1v3abv5">
          <div
            className={`font-medium ${getRiskColor(risk)}`}
            data-oid="dyxc5ue"
          >
            {risk}%
          </div>
          <div className="h-2 w-16 rounded-full bg-muted" data-oid="6mcmmgr">
            <div
              className={`h-full rounded-full ${
                risk <= 30
                  ? "bg-green-500"
                  : risk <= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${risk}%` }}
              data-oid="zuvzz62"
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu data-oid=".:tl-6k">
        <DropdownMenuTrigger asChild data-oid="xx14t-5">
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
            data-oid="qwcgrer"
          >
            <MoreVerticalIcon data-oid="dp0y0os" />
            <span className="sr-only" data-oid="tqdxb2d">
              Open menu
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32" data-oid="vj0o1je">
          <DropdownMenuItem data-oid="wg0farz">View Details</DropdownMenuItem>
          <DropdownMenuItem data-oid="61b1ika">Edit</DropdownMenuItem>
          <DropdownMenuSeparator data-oid="-8ehllj" />
          <DropdownMenuItem data-oid="3s-1xna">Delete</DropdownMenuItem>
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
      data-oid="zewy-gj"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} data-oid="9sjoroh">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function PRDataTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [allData, setAllData] = React.useState<z.infer<typeof schema>[]>([]); // Store all data
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      // Hide these by default
      drag: false,
      select: false,
      title: false,
      status: false,
      changes: false,
      comments: false,
      reviewers: false,
      "metrics.code_quality_score": false,
      "metrics.risk_rate": false,
      actions: false,
      // Show these by default (all others will be visible)
      focus: true,
      author: true,
      created_at: true,
      "metrics.cycle_time": true,
      "metrics.time_to_first_review": true,
      "metrics.coding_time": true,
      "metrics.pickup_time": true,
      "metrics.review_time": true,
      "metrics.merge_time_duration": true,
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
  const [viewType, setViewType] = React.useState<
    "all" | "open" | "closed" | "merged"
  >("all");

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
      (pr) =>
        new Date(pr.created_at) >= dateLimit && new Date(pr.created_at) <= now,
    );

    // Sort by created date, newest first
    filteredData.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    setData(filteredData);
    // Reset pagination when data changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [timeRange, allData]);

  // Generate sample data (replace with real data fetching)
  React.useEffect(() => {
    const authors = [
      "Sarah Chen",
      "Alex Rodriguez",
      "Maya Patel",
      "James Wilson",
      "Lena Kim",
      "David Thompson",
      "Aisha Ahmed",
      "Marcus Johnson",
    ];

    const reviewers = [
      "Emma Davis",
      "Carlos Martinez",
      "Priya Sharma",
      "Thomas Anderson",
      "Sophie Martin",
      "Ryan O'Connor",
      "Yuki Tanaka",
      "Zainab Ali",
    ];

    const prTitles = [
      "feat: Implement real-time collaboration features",
      "fix: Resolve memory leak in WebSocket connection",
      "chore: Update dependencies to latest versions",
      "docs: Add API documentation for new endpoints",
      "enhancement: Improve dashboard performance",
      "security: Fix SQL injection vulnerability",
      "feat: Add dark mode support",
      "fix: Address cross-browser compatibility issues",
      "docs: Update deployment guide",
      "chore: Clean up deprecated code",
      "enhancement: Optimize image loading",
      "security: Implement rate limiting",
      "feat: Add multi-language support",
      "fix: Resolve race condition in state management",
      "enhancement: Improve mobile responsiveness",
    ];

    const getRandomDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date.toISOString();
    };

    const getRandomReviewers = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...reviewers].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const getFocusFromTitle = (title: string): PRFocus => {
      if (title.startsWith("feat:")) return "feature";
      if (title.startsWith("fix:")) return "bug";
      if (title.startsWith("chore:")) return "chore";
      if (title.startsWith("docs:")) return "documentation";
      if (title.startsWith("enhancement:")) return "enhancement";
      if (title.startsWith("security:")) return "security";
      return "feature";
    };

    const getChangesSize = (focus: PRFocus) => {
      // Different types of PRs tend to have different sizes
      const sizeRanges = {
        feature: {
          additions: [100, 1000],
          deletions: [50, 500],
          files: [5, 20],
        },
        bug: { additions: [10, 100], deletions: [5, 50], files: [1, 5] },
        chore: { additions: [50, 200], deletions: [50, 200], files: [2, 10] },
        documentation: {
          additions: [20, 300],
          deletions: [10, 100],
          files: [1, 3],
        },
        enhancement: {
          additions: [50, 500],
          deletions: [20, 200],
          files: [3, 15],
        },
        security: { additions: [20, 200], deletions: [10, 100], files: [1, 8] },
      };

      const range = sizeRanges[focus];
      return {
        additions:
          Math.floor(
            Math.random() * (range.additions[1] - range.additions[0]),
          ) + range.additions[0],
        deletions:
          Math.floor(
            Math.random() * (range.deletions[1] - range.deletions[0]),
          ) + range.deletions[0],
        files:
          Math.floor(Math.random() * (range.files[1] - range.files[0])) +
          range.files[0],
      };
    };

    const generatePRMetrics = (
      created_at: string,
      status: PRStatus,
      focus: PRFocus,
      changes: { additions: number; deletions: number; files: number },
    ) => {
      const now = new Date();
      const createdDate = new Date(created_at);
      const totalChanges = changes.additions + changes.deletions;

      // Generate realistic review and merge times
      const reviewStartedAt = new Date(
        createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
      );
      const firstReviewAt = new Date(
        reviewStartedAt.getTime() + Math.random() * 48 * 60 * 60 * 1000,
      );
      const mergeDate =
        status === "merged"
          ? new Date(
              firstReviewAt.getTime() + Math.random() * 72 * 60 * 60 * 1000,
            )
          : undefined;

      // Calculate various time metrics
      const cycleTime =
        status === "merged"
          ? calculateHoursBetween(created_at, mergeDate!.toISOString())
          : calculateHoursBetween(created_at, now.toISOString());

      const timeToFirstReview =
        status !== "open"
          ? calculateHoursBetween(created_at, firstReviewAt.toISOString())
          : undefined;

      const pickupTime =
        status !== "open"
          ? calculateHoursBetween(created_at, reviewStartedAt.toISOString())
          : undefined;

      const reviewTime =
        status !== "open"
          ? calculateHoursBetween(
              reviewStartedAt.toISOString(),
              firstReviewAt.toISOString(),
            )
          : undefined;

      const mergeTimeDuration =
        status === "merged"
          ? calculateHoursBetween(
              firstReviewAt.toISOString(),
              mergeDate!.toISOString(),
            )
          : undefined;

      // Calculate code quality score based on various factors
      const codeQualityFactors = {
        changeSize: Math.max(0, 100 - totalChanges / 100), // Smaller changes are better
        filesChanged: Math.max(0, 100 - changes.files * 5), // Fewer files are better
        focusImpact: {
          feature: 80,
          bug: 75,
          enhancement: 85,
          documentation: 90,
          chore: 85,
          security: 70,
        }[focus],
      };

      const codeQualityScore = Math.round(
        (codeQualityFactors.changeSize +
          codeQualityFactors.filesChanged +
          codeQualityFactors.focusImpact) /
          3,
      );

      // Calculate risk rate based on various factors
      const riskFactors = {
        changeSize: Math.min(100, totalChanges / 100), // Larger changes are riskier
        filesChanged: Math.min(100, changes.files * 5), // More files are riskier
        focusRisk: {
          feature: 60,
          bug: 40,
          enhancement: 50,
          documentation: 20,
          chore: 30,
          security: 80,
        }[focus],
      };

      const riskRate = Math.round(
        (riskFactors.changeSize +
          riskFactors.filesChanged +
          riskFactors.focusRisk) /
          3,
      );

      return {
        first_review_at: firstReviewAt.toISOString(),
        review_started_at: reviewStartedAt.toISOString(),
        metrics: {
          cycle_time: cycleTime,
          time_to_first_review: timeToFirstReview,
          coding_time: pickupTime || cycleTime,
          pickup_time: pickupTime,
          review_time: reviewTime,
          merge_time_duration: mergeTimeDuration,
          code_quality_score: codeQualityScore,
          risk_rate: riskRate,
        },
      };
    };

    const sampleData: z.infer<typeof schema>[] = Array.from(
      { length: 50 },
      (_, i) => {
        const title = prTitles[Math.floor(Math.random() * prTitles.length)];
        const focus = getFocusFromTitle(title);
        const created_at = getRandomDate(365);
        const status =
          Math.random() > 0.7
            ? "open"
            : Math.random() > 0.5
              ? "merged"
              : "closed";
        const changes = getChangesSize(focus);
        const metrics = generatePRMetrics(created_at, status, focus, changes);

        return {
          id: i + 1,
          title,
          number: 1000 + i,
          author: authors[Math.floor(Math.random() * authors.length)],
          status,
          focus,
          reviewers: getRandomReviewers(),
          created_at,
          updated_at: getRandomDate(
            Math.min(7, new Date().getTime() - new Date(created_at).getTime()),
          ),
          merge_time:
            status === "merged"
              ? metrics.metrics.merge_time_duration?.toString()
              : undefined,
          first_review_at: metrics.first_review_at,
          review_started_at: metrics.review_started_at,
          comments: Math.floor(Math.random() * 15),
          changes,
          metrics: metrics.metrics,
        };
      },
    );

    // Store all data
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
      data-oid="k1nw1f9"
    />
  );

  return (
    <DashboardLayout
      title="Pull Requests"
      description={`Showing pull requests from the last ${timeRange.replace(
        /(\d+)/,
        "$1 ",
      )}`}
      menuContent={menuContent}
      data-oid="k.s_eq_"
    >
      <div className="flex flex-col gap-4" data-oid="c_nc:sn">
        <div className="flex items-center justify-between" data-oid=":ndw8sv">
          <div className="flex items-center gap-2" data-oid="1ftm2x0">
            <Input
              placeholder="Filter PRs..."
              value={
                (table.getColumn("title")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
              data-oid="bd916k7"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border" data-oid="hrqdq5r">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
            data-oid="t4lv1yc"
          >
            <Table data-oid="kmi:20k">
              <TableHeader
                className="sticky top-0 z-10 bg-muted"
                data-oid="lp0rl57"
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} data-oid="_tpg731">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          data-oid="p4y_.c:"
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
              <TableBody data-oid="hsuksub">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                    data-oid="1t-p2_g"
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} data-oid="871rtuf" />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow data-oid="pb7qcek">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                      data-oid="4ewqafl"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between" data-oid=":b5nci5">
          <div className="text-sm text-muted-foreground" data-oid="o_cgcxd">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2" data-oid="jyw4ju.">
            <div className="flex items-center gap-2" data-oid="gb6st9c">
              <Label
                htmlFor="rows-per-page"
                className="text-sm font-medium"
                data-oid="_q_-wrr"
              >
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value: string) => {
                  table.setPageSize(Number(value));
                }}
                data-oid="z2y6flb"
              >
                <SelectTrigger
                  className="w-20"
                  id="rows-per-page"
                  data-oid="f63eitt"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                    data-oid="fc.y51n"
                  />
                </SelectTrigger>
                <SelectContent side="top" data-oid="92ijw8-">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      data-oid="zgbv:lp"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2" data-oid="957h96m">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                data-oid="1h4z-av"
              >
                <span className="sr-only" data-oid="x-jl258">
                  Go to first page
                </span>
                <ChevronsLeftIcon className="size-4" data-oid="10:0:mx" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                data-oid="-_8p1v0"
              >
                <span className="sr-only" data-oid="fpeql3v">
                  Go to previous page
                </span>
                <ChevronLeftIcon className="size-4" data-oid="5ahi3.d" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                data-oid="a-b_xhc"
              >
                <span className="sr-only" data-oid="i72kexy">
                  Go to next page
                </span>
                <ChevronRightIcon className="size-4" data-oid="978tkjz" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                data-oid="gjfhaif"
              >
                <span className="sr-only" data-oid="wrwgltj">
                  Go to last page
                </span>
                <ChevronsRightIcon className="size-4" data-oid="4t9cok3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
