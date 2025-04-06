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
import { Settings2, ArrowLeft, ArrowRight } from "lucide-react";

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
}

export function DashboardLayout({
  title,
  description,
  menuContent,
  pagination,
  children,
}: DashboardLayoutProps) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
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
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">
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
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 data-[state=open]:bg-accent"
                aria-label="Dashboard settings"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 overflow-hidden rounded-lg p-0"
              align="end"
            >
              {menuContent}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-hidden">{children}</CardContent>
    </Card>
  );
}
