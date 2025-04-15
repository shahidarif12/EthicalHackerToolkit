import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentScansTable } from "@/components/dashboard/recent-scans-table";
import { RecentScan, Stats, TerminalOutput } from "@/types/security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "@/components/ui/terminal-output";
import { ScanModal } from "@/components/ui/scan-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, ServerOff, Bug, Router, Code } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput>({
    lines: [
      { text: "# Welcome to SecureTest Platform", type: "info" },
      { text: "$ dig example.com +short", type: "command" },
      { text: "93.184.216.34", type: "output" },
      { text: "# Checking HTTP response headers", type: "info" },
      { text: "$ curl -I https://example.com", type: "command" },
      { text: "HTTP/2 200", type: "output" },
      { text: "content-type: text/html; charset=UTF-8", type: "output" },
      { text: "date: " + new Date().toUTCString(), type: "output" },
      { text: "server: ECS (sec/96EC)", type: "output" },
      { text: "# Ready for your security testing commands", type: "success" },
    ],
  });

  // Fetch scans
  const { data: scans = [], isLoading: isLoadingScans } = useQuery<RecentScan[]>({
    queryKey: ["/api/scans"],
    staleTime: 30000, // 30 seconds
  });

  // Calculate stats
  const stats: Stats = {
    totalScans: scans.length,
    vulnerabilities: scans.reduce((total, scan) => {
      if (scan.findings && (scan.findings.high || scan.findings.medium || scan.findings.low)) {
        return total + (scan.findings.high || 0) + (scan.findings.medium || 0) + (scan.findings.low || 0);
      }
      return total;
    }, 0),
    reports: Math.floor(scans.length * 0.7), // Just an example calculation
    lastScan: scans.length > 0 ? scans[0].date : "Never",
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setScanModalOpen(true)}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Scans"
            value={stats.totalScans}
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>}
            trend={{ value: "+12% from last month", positive: true }}
          />
          <StatCard
            title="Vulnerabilities"
            value={stats.vulnerabilities}
            icon={<Bug className="h-5 w-5" />}
            trend={{ value: "+5 new since last week", positive: false }}
          />
          <StatCard
            title="Reports Generated"
            value={stats.reports}
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>}
            trend={{ value: `Last generated ${stats.lastScan}` }}
          />
          <StatCard
            title="System Status"
            value="Operational"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>}
            trend={{ value: "All systems running normally", positive: true }}
          />
        </div>

        {/* Recent Scans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Scans</CardTitle>
            <Link href="/reports">
              <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">
                View All
              </Button>
            </Link>
          </CardHeader>
          {isLoadingScans ? (
            <CardContent className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          ) : scans.length === 0 ? (
            <CardContent className="h-48 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground mb-4">No scans yet. Start securing your applications now!</p>
              <Button onClick={() => setScanModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Security Scan
              </Button>
            </CardContent>
          ) : (
            <RecentScansTable scans={scans} />
          )}
        </Card>

        {/* Tools and Terminal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <form className="flex">
                  <input
                    type="text"
                    className="flex-1 rounded-l-md border border-input px-3 py-2 text-sm ring-offset-background"
                    placeholder="example.com"
                  />
                  <Button className="rounded-l-none">Scan</Button>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Link href="/reconnaissance">
                  <a className="card p-3 flex items-center justify-center text-center hover:bg-muted rounded-md border border-input">
                    <div>
                      <ServerOff className="h-6 w-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium mt-1">DNS Lookup</div>
                    </div>
                  </a>
                </Link>
                <Link href="/reconnaissance">
                  <a className="card p-3 flex items-center justify-center text-center hover:bg-muted rounded-md border border-input">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary mx-auto mb-1"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                      <div className="text-sm font-medium mt-1">WHOIS</div>
                    </div>
                  </a>
                </Link>
                <Link href="/reconnaissance">
                  <a className="card p-3 flex items-center justify-center text-center hover:bg-muted rounded-md border border-input">
                    <div>
                      <Router className="h-6 w-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium mt-1">Port Scan</div>
                    </div>
                  </a>
                </Link>
                <Link href="/reconnaissance">
                  <a className="card p-3 flex items-center justify-center text-center hover:bg-muted rounded-md border border-input">
                    <div>
                      <Code className="h-6 w-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium mt-1">Technology Scan</div>
                    </div>
                  </a>
                </Link>
              </div>

              <div className="flex justify-center">
                <Link href="/reconnaissance">
                  <a className="text-primary text-sm font-medium flex items-center">
                    View All Tools
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terminal Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Terminal output={terminalOutput} className="h-[300px]" />
            </CardContent>
          </Card>
        </div>
      </div>

      <ScanModal open={scanModalOpen} onOpenChange={setScanModalOpen} />
    </Layout>
  );
}
