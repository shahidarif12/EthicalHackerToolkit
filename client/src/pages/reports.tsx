import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports"],
  });
  
  // Filter reports based on search query
  const filteredReports = reports.filter((report: any) => {
    if (!searchQuery) return true;
    const target = report.reportData?.target || "";
    const scanType = report.reportData?.scanType || "";
    const searchLower = searchQuery.toLowerCase();
    return (
      target.toLowerCase().includes(searchLower) ||
      scanType.toLowerCase().includes(searchLower)
    );
  });

  const getScanTypeColor = (type: string) => {
    switch (type) {
      case "reconnaissance":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "vulnerability":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "web-automation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const downloadReport = (report: any) => {
    try {
      // Create a JSON blob and download it
      const reportJson = JSON.stringify(report.reportData, null, 2);
      const blob = new Blob([reportJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${report.id}-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: "Report Downloaded",
        description: "The report has been downloaded as a JSON file."
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the report.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-muted-foreground">
            View and manage security scan reports.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Scan Reports</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search reports..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No reports found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery ? "Try a different search query." : "Generate some scan reports to get started."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report: any) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">#{report.id}</TableCell>
                        <TableCell>{report.reportData?.target || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            getScanTypeColor(report.reportData?.scanType || "")
                          )}>
                            {report.reportData?.scanType || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.createdAt ? formatDate(report.createdAt) : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => downloadReport(report)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
