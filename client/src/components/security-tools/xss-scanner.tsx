import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ScanResult } from "@/types/security";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Code, Shield, Terminal, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define form schema
const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  customPayloads: z.string().optional(),
  scanType: z.enum(["reflected", "stored", "dom", "comprehensive"]).default("comprehensive"),
  scanDepth: z.enum(["shallow", "normal", "deep"]).default("normal"),
});

type FormValues = z.infer<typeof formSchema>;

export function XSSScanner() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scan");
  const [terminalOutput, setTerminalOutput] = useState<
    { text: string; type: "info" | "success" | "error" | "warning" | "command" | "output" }[]
  >([
    { text: "XSS Scanner initialized.", type: "info" },
    { text: "Ready to scan for Cross-Site Scripting vulnerabilities.", type: "info" },
  ]);
  const [scanResults, setScanResults] = useState<any | null>(null);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      customPayloads: "",
      scanType: "comprehensive",
      scanDepth: "normal",
    },
  });

  // Mutation for the scan
  const xssScanMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Starting XSS scan on ${values.url}...`, type: "command" });
      updateTerminal({
        text: `Scan type: ${values.scanType}. Scan depth: ${values.scanDepth}`,
        type: "info",
      });

      const res = await apiRequest("POST", "/api/tools/xss-scan", values);
      return await res.json() as ScanResult;
    },
    onSuccess: (data: ScanResult) => {
      const results = data.results as any;
      setScanResults(results);

      updateTerminal({
        text: `Scan completed. ScanID: ${data.scanId}`,
        type: "success",
      });

      if (results.error) {
        updateTerminal({
          text: `Error: ${results.error}`,
          type: "error",
        });
        return;
      }

      // Switch to results tab
      setActiveTab("results");

      updateTerminal({
        text: `Found ${results.vulnerabilities.length} potential XSS vulnerabilities.`,
        type: "info",
      });

      results.vulnerabilities.forEach((vuln: any, index: number) => {
        updateTerminal({
          text: `Vulnerability #${index + 1}: ${vuln.type} XSS in ${vuln.location}`,
          type: vuln.severity === "high" ? "error" : vuln.severity === "medium" ? "warning" : "info",
        });
        updateTerminal({
          text: `Context: ${vuln.context}`,
          type: "output",
        });
        if (vuln.payload) {
          updateTerminal({
            text: `Test payload: ${vuln.payload}`,
            type: "output",
          });
        }
      });

      updateTerminal({
        text: `Tested ${results.injectionPoints?.length || 0} potential injection points.`,
        type: "info",
      });

      toast({
        title: "XSS Scan Completed",
        description: `Found ${results.vulnerabilities.length} potential vulnerabilities.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({
        text: `Scan failed: ${error.message}`,
        type: "error",
      });
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: error.message,
      });
    },
  });

  // Update terminal function
  function updateTerminal(line: { text: string; type: "info" | "success" | "error" | "warning" | "command" | "output" }) {
    setTerminalOutput((prev) => [...prev, line]);
  }

  // Form submission handler
  function onSubmit(values: FormValues) {
    setTerminalOutput([
      { text: "XSS Scanner initialized.", type: "info" },
      { text: "Starting new scan...", type: "info" },
    ]);
    setScanResults(null);
    xssScanMutation.mutate(values);
  }

  // Function to clear the terminal
  function clearTerminal() {
    setTerminalOutput([
      { text: "Terminal cleared.", type: "info" },
      { text: "Ready for new scan.", type: "info" },
    ]);
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">Scan Configuration</TabsTrigger>
          <TabsTrigger value="results" disabled={!scanResults}>
            Results {scanResults && <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  XSS Vulnerability Scanner
                </CardTitle>
                <CardDescription>
                  Test web applications for Cross-Site Scripting (XSS) vulnerabilities. This scanner identifies reflected, stored, and DOM-based XSS issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/page" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scanType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scan Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select scan type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reflected">Reflected XSS Only</SelectItem>
                              <SelectItem value="stored">Stored XSS Only</SelectItem>
                              <SelectItem value="dom">DOM-based XSS Only</SelectItem>
                              <SelectItem value="comprehensive">Comprehensive (All Types)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scanDepth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scan Depth</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select scan depth" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="shallow">Shallow (Fast, basic checks)</SelectItem>
                              <SelectItem value="normal">Normal (Balanced)</SelectItem>
                              <SelectItem value="deep">Deep (Thorough, slower)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customPayloads"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom XSS Payloads (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter custom XSS payloads, one per line" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <CardDescription className="text-xs">
                            Leave blank to use default payloads
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 flex gap-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={xssScanMutation.isPending}
                      >
                        {xssScanMutation.isPending ? (
                          <>
                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Start Scan
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={clearTerminal}
                        disabled={xssScanMutation.isPending}
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Results Terminal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Scanner Output
                </CardTitle>
                <CardDescription>
                  Live output from the XSS vulnerability scanner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <ScrollArea className="h-[400px] w-full rounded-md border bg-black text-white font-mono text-sm p-4">
                    {terminalOutput.map((line, index) => (
                      <div key={index} className="mb-1">
                        <span
                          className={
                            line.type === "info"
                              ? "text-blue-400"
                              : line.type === "success"
                              ? "text-green-400"
                              : line.type === "error"
                              ? "text-red-400"
                              : line.type === "warning"
                              ? "text-yellow-400"
                              : line.type === "command"
                              ? "text-purple-400"
                              : "text-gray-300"
                          }
                        >
                          {line.type === "info" && "[INFO] "}
                          {line.type === "success" && "[SUCCESS] "}
                          {line.type === "error" && "[ERROR] "}
                          {line.type === "warning" && "[WARNING] "}
                          {line.type === "command" && "[COMMAND] "}
                          {line.type === "output" && "> "}
                        </span>
                        {line.text}
                      </div>
                    ))}
                  </ScrollArea>

                  {xssScanMutation.isPending && (
                    <div className="absolute bottom-4 right-4 bg-black rounded-full p-2">
                      <RefreshCcw className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Warning notice */}
                <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Legal Warning</p>
                    <p className="text-xs">
                      Only scan websites you own or have explicit permission to test. Unauthorized scanning of websites may be
                      illegal in many jurisdictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          {scanResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  XSS Scan Results
                </CardTitle>
                <CardDescription>
                  Detailed analysis of detected XSS vulnerabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary Section */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Total Vulnerabilities</div>
                      <div className="text-2xl font-bold">{scanResults.vulnerabilities?.length || 0}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Injection Points</div>
                      <div className="text-2xl font-bold">{scanResults.injectionPoints?.length || 0}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Security Score</div>
                      <div className="text-2xl font-bold text-orange-500">{scanResults.securityScore || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Vulnerabilities List */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Detected Vulnerabilities</h3>
                    {scanResults.vulnerabilities?.length > 0 ? (
                      <div className="space-y-4">
                        {scanResults.vulnerabilities.map((vuln: any, index: number) => (
                          <div key={index} className="rounded-md border p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{vuln.type} XSS in {vuln.location}</h4>
                              <Badge
                                variant={
                                  vuln.severity === "high"
                                    ? "destructive"
                                    : vuln.severity === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {vuln.severity} severity
                              </Badge>
                            </div>
                            <div className="text-sm space-y-2">
                              <div>
                                <span className="font-medium text-muted-foreground">Context: </span>
                                {vuln.context}
                              </div>
                              {vuln.payload && (
                                <div>
                                  <span className="font-medium text-muted-foreground">Payload: </span>
                                  <code className="px-1 py-0.5 bg-muted rounded text-xs">{vuln.payload}</code>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-muted-foreground">Description: </span>
                                {vuln.description}
                              </div>
                              {vuln.remediation && (
                                <div>
                                  <span className="font-medium text-muted-foreground">Recommended Fix: </span>
                                  {vuln.remediation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-medium mb-1">No XSS Vulnerabilities Found</h3>
                        <p className="text-muted-foreground">
                          The scanned website appears to be secure against XSS attacks based on our tests.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {scanResults.recommendations && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Security Recommendations</h3>
                      <ul className="space-y-1 list-disc list-inside text-sm">
                        {scanResults.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}