import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Activity,
  CalendarClock, 
  Search as SearchIcon,
  Bug,
  FileText,
  LogIn,
  LogOut,
  Settings,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

// This is a sample activity log for display
// In a real app, this would come from an API
const MOCK_ACTIVITY = [
  {
    id: 1,
    type: "login",
    message: "Logged in to account",
    date: "2023-04-15T09:32:45",
    ipAddress: "192.168.1.105",
    userAgent: "Chrome/98.0.4758.102"
  },
  {
    id: 2,
    type: "scan",
    message: "Initiated vulnerability scan on example.com",
    date: "2023-04-15T10:15:22",
    target: "example.com",
    scanType: "vulnerability"
  },
  {
    id: 3,
    type: "report",
    message: "Generated report for vulnerability scan",
    date: "2023-04-15T10:18:37",
    reportId: 12345,
    scanId: 987
  },
  {
    id: 4,
    type: "scan",
    message: "Initiated DNS lookup on testdomain.org",
    date: "2023-04-14T14:22:15",
    target: "testdomain.org",
    scanType: "reconnaissance"
  },
  {
    id: 5,
    type: "settings",
    message: "Updated account password",
    date: "2023-04-14T16:05:30",
    settingType: "security"
  },
  {
    id: 6,
    type: "report",
    message: "Downloaded report #12344",
    date: "2023-04-14T16:12:53",
    reportId: 12344,
    format: "PDF"
  },
  {
    id: 7,
    type: "scan",
    message: "Initiated port scan on securitytarget.com",
    date: "2023-04-13T11:30:42",
    target: "securitytarget.com",
    scanType: "reconnaissance"
  },
  {
    id: 8,
    type: "logout",
    message: "Logged out from account",
    date: "2023-04-13T17:45:12",
    ipAddress: "192.168.1.105"
  },
  {
    id: 9,
    type: "login",
    message: "Logged in to account",
    date: "2023-04-12T08:55:33",
    ipAddress: "192.168.1.105",
    userAgent: "Chrome/98.0.4758.102"
  },
  {
    id: 10,
    type: "scan",
    message: "Initiated web automation on webtest.com",
    date: "2023-04-12T10:20:19",
    target: "webtest.com",
    scanType: "web-automation"
  }
];

export default function ActivityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate a data query - this would be a real API call in production
  const { data: activityLogs = MOCK_ACTIVITY, isLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
    // This is mocked - in a real app, remove this
    queryFn: () => Promise.resolve(MOCK_ACTIVITY)
  });

  // Filter logs based on active tab and search query
  const filteredLogs = activityLogs.filter(log => {
    const matchesTab = activeTab === "all" || log.type === activeTab;
    const matchesSearch = searchQuery === "" || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "logout":
        return <LogOut className="h-4 w-4" />;
      case "scan":
        return <SearchIcon className="h-4 w-4" />;
      case "report":
        return <FileText className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "logout":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "scan":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "report":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "settings":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getScanTypeIcon = (scanType?: string) => {
    if (!scanType) return null;
    
    switch (scanType) {
      case "reconnaissance":
        return <SearchIcon className="h-3 w-3 mr-1" />;
      case "vulnerability":
        return <Bug className="h-3 w-3 mr-1" />;
      case "web-automation":
        return <code className="text-xs font-mono mr-1">&lt;/&gt;</code>;
      default:
        return null;
    }
  };

  const getScanTypeClass = (scanType?: string) => {
    if (!scanType) return "";
    
    switch (scanType) {
      case "reconnaissance":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "vulnerability":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "web-automation":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
      default:
        return "";
    }
  };

  const clearFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Activity Log</h1>
          <p className="text-muted-foreground">
            Track your actions and security testing activities.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Account Activity</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search activities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              View a history of your account activity and security testing operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="login">Logins</TabsTrigger>
                  <TabsTrigger value="scan">Scans</TabsTrigger>
                  <TabsTrigger value="report">Reports</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                {(activeTab !== "all" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>

              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                      <Activity className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No activity logs found</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery ? "Try a different search query or filter." : "There are no activities to display yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLogs.map((log, index) => {
                      // Group logs by date
                      const currentDate = new Date(log.date).toDateString();
                      const prevDate = index > 0 ? new Date(filteredLogs[index - 1].date).toDateString() : null;
                      
                      // Show date divider when date changes
                      const showDateDivider = index === 0 || currentDate !== prevDate;

                      return (
                        <div key={log.id}>
                          {showDateDivider && (
                            <div className="flex items-center my-4">
                              <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <h3 className="text-sm font-medium text-muted-foreground">
                                {new Date(log.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h3>
                              <div className="ml-2 h-px flex-1 bg-border"></div>
                            </div>
                          )}

                          <div className="flex items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className={cn(
                              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full",
                              getTypeColor(log.type).split(' ')[0].replace("text", "bg")
                            )}>
                              {getTypeIcon(log.type)}
                            </div>
                            
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex flex-wrap justify-between gap-x-2 gap-y-1">
                                <p className="text-sm font-medium">{log.message}</p>
                                <time className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(log.date)}
                                </time>
                              </div>
                              
                              <div className="mt-1 flex flex-wrap gap-2">
                                <Badge variant="outline" className={cn(
                                  "text-xs capitalize",
                                  getTypeColor(log.type)
                                )}>
                                  {getTypeIcon(log.type)}
                                  <span className="ml-1">{log.type}</span>
                                </Badge>
                                
                                {log.scanType && (
                                  <Badge variant="outline" className={cn(
                                    "text-xs border",
                                    getScanTypeClass(log.scanType)
                                  )}>
                                    {getScanTypeIcon(log.scanType)}
                                    <span>{log.scanType}</span>
                                  </Badge>
                                )}
                                
                                {log.ipAddress && (
                                  <span className="text-xs text-muted-foreground">
                                    IP: {log.ipAddress}
                                  </span>
                                )}
                                
                                {log.target && !log.scanType && (
                                  <span className="text-xs text-muted-foreground">
                                    Target: {log.target}
                                  </span>
                                )}
                                
                                {log.reportId && (
                                  <span className="text-xs text-muted-foreground">
                                    Report #{log.reportId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}