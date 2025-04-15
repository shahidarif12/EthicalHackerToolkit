import { RecentScan } from "@/types/security";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Download, 
  Search, 
  Bug, 
  Code, 
  RotateCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentScansTableProps {
  scans: RecentScan[];
  className?: string;
}

export function RecentScansTable({ scans, className }: RecentScansTableProps) {
  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case "reconnaissance":
        return <Search className="h-3 w-3 mr-1" />;
      case "vulnerability":
        return <Bug className="h-3 w-3 mr-1" />;
      case "web-automation":
        return <Code className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getScanTypeClass = (type: string) => {
    switch (type) {
      case "reconnaissance":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "vulnerability":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "web-automation":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan) => (
              <TableRow key={scan.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{scan.target}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
                      getScanTypeClass(scan.scanType)
                    )}
                  >
                    {getScanTypeIcon(scan.scanType)}
                    {scan.scanType.charAt(0).toUpperCase() + scan.scanType.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {scan.date}
                </TableCell>
                <TableCell>
                  {scan.status === "in-progress" ? (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                      In Progress
                    </Badge>
                  ) : scan.status === "completed" ? (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Completed
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    >
                      Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {scan.status === "in-progress" ? (
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {scan.findings?.low !== undefined && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-200 dark:bg-yellow-800 border-2 border-background flex items-center justify-center text-xs font-medium">
                          {scan.findings.low}
                        </span>
                      )}
                      {scan.findings?.medium !== undefined && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-200 dark:bg-orange-800 border-2 border-background -ml-1 flex items-center justify-center text-xs font-medium">
                          {scan.findings.medium}
                        </span>
                      )}
                      {scan.findings?.high !== undefined && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 border-2 border-background -ml-1 flex items-center justify-center text-xs font-medium">
                          {scan.findings.high}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="icon" variant="ghost">
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={scan.status !== "completed"}
                    >
                      <Download
                        className={cn(
                          "h-4 w-4",
                          scan.status === "completed"
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
