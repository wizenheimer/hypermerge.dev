import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings2, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

interface PaginationControls {
  currentPage: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  totalPages: number;
}

interface DashboardLayoutProps {
  title: string;
  description: string;
  menuContent: React.ReactNode;
  pagination?: PaginationControls;
  children: React.ReactNode;
  viewMore?: {
    label: string;
    onClick: () => void;
  };
}

export function DashboardLayout({
  title,
  description,
  menuContent,
  pagination,
  children,
  viewMore,
}: DashboardLayoutProps) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <Card className="w-full" data-oid="ju77jvc">
      <CardHeader
        className="flex flex-row items-center justify-between"
        data-oid="j5ssrig"
      >
        <div data-oid="2lb.ipl">
          <CardTitle className="text-xl font-semibold" data-oid="4pzbp4c">
            {title}
          </CardTitle>
          <CardDescription
            className="text-sm text-muted-foreground"
            data-oid="cw:okxc"
          >
            {description}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2" data-oid="bogp25x">
          {pagination && pagination.totalPages > 1 && (
            <>
              <button
                onClick={pagination.handlePreviousPage}
                disabled={pagination.isPrevDisabled}
                className={`p-2 ${
                  pagination.isPrevDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:text-foreground"
                }`}
                aria-label="Previous page"
                data-oid="vk42gmq"
              >
                <ArrowLeft className="h-4 w-4" data-oid="-:a96z5" />
              </button>
              <span
                className="text-sm text-muted-foreground"
                data-oid="0o48lpr"
              >
                {pagination.currentPage + 1} / {pagination.totalPages}
              </span>
              <button
                onClick={pagination.handleNextPage}
                disabled={pagination.isNextDisabled}
                className={`p-2 ${
                  pagination.isNextDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:text-foreground"
                }`}
                aria-label="Next page"
                data-oid="fx2sit2"
              >
                <ArrowRight className="h-4 w-4" data-oid="lj1m6w3" />
              </button>
            </>
          )}
          {viewMore && (
            <Button
              variant="outline"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={viewMore.onClick}
              data-oid="f-33ge_"
            >
              {viewMore.label}
              <ChevronRight className="ml-1 h-4 w-4" data-oid="vi5.kx-" />
            </Button>
          )}
          <Popover
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            data-oid="733o56z"
          >
            <PopoverTrigger asChild data-oid="dqyuj4g">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 data-[state=open]:bg-accent"
                aria-label="Dashboard settings"
                data-oid="s533ftv"
              >
                <Settings2 className="h-4 w-4" data-oid="y1ixp0g" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 overflow-hidden rounded-lg p-0"
              align="end"
              data-oid=":9gezkx"
            >
              {menuContent}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-hidden" data-oid="4499lwh">
        {children}
      </CardContent>
    </Card>
  );
}
