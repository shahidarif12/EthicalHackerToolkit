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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Database, Shield, Terminal, RefreshCcw } from "lucide-react";

// Define form schema
const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  paramNames: z.string().optional(),
  testLevel: z.enum(["basic", "intermediate", "advanced"]),
  includeAuth: z.boolean().default(false),
  authUsername: z.string().optional(),
  authPassword: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SQLInjectionScanner() {
  const { toast } = useToast();
  const [terminalOutput, setTerminalOutput] = useState<
    { text: string; type: "info" | "success" | "error" | "warning" | "command" | "output" }[]
  >([
    { text: "SQL Injection Scanner initialized.", type: "info" },
    { text: "Ready to scan for SQL injection vulnerabilities.", type: "info" },
  ]);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      paramNames: "",
      testLevel: "basic",
      includeAuth: false,
      authUsername: "",
      authPassword: "",
    },
  });

  // Watch the includeAuth value to conditionally show auth fields
  const includeAuth = form.watch("includeAuth");

  // Mutation for the scan
  const sqlScanMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Starting SQL injection scan on ${values.url}...`, type: "command" });
      updateTerminal({
        text: `Test level: ${values.testLevel}. Auth: ${values.includeAuth ? "Enabled" : "Disabled"}`,
        type: "info",
      });

      const res = await apiRequest("POST", "/api/tools/sql-injection", values);
      return await res.json() as ScanResult;
    },
    onSuccess: (data: ScanResult) => {
      const results = data.results as any;

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

      updateTerminal({
        text: `Found ${results.vulnerabilities.length} potential SQL injection vulnerabilities.`,
        type: "info",
      });

      results.vulnerabilities.forEach((vuln: any, index: number) => {
        updateTerminal({
          text: `Vulnerability #${index + 1}: ${vuln.parameter} - ${vuln.severity} risk`,
          type: vuln.severity === "high" ? "error" : vuln.severity === "medium" ? "warning" : "info",
        });
        updateTerminal({
          text: `Details: ${vuln.details}`,
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
        text: `Tested ${results.testedUrls?.length || 0} URLs and ${results.testedParams?.length || 0} parameters.`,
        type: "info",
      });

      toast({
        title: "SQL Injection Scan Completed",
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
      { text: "SQL Injection Scanner initialized.", type: "info" },
      { text: "Starting new scan...", type: "info" },
    ]);
    sqlScanMutation.mutate(values);
  }

  // Function to clear the terminal
  function clearTerminal() {
    setTerminalOutput([
      { text: "Terminal cleared.", type: "info" },
      { text: "Ready for new scan.", type: "info" },
    ]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Injection Scanner
          </CardTitle>
          <CardDescription>
            Test web applications for SQL injection vulnerabilities. This scanner tests for various SQL injection
            techniques and reports potential vulnerabilities.
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
                      <Input placeholder="https://example.com/page.php?id=1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paramNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameter Names (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="id,page,user (comma separated)" {...field} />
                    </FormControl>
                    <CardDescription className="text-xs">
                      Leave blank to auto-detect parameters from the URL
                    </CardDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic (Faster, less thorough)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Balanced)</SelectItem>
                        <SelectItem value="advanced">Advanced (Slower, more thorough)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeAuth"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Include Authentication</FormLabel>
                      <CardDescription className="text-xs">
                        Enable to test authenticated pages
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {includeAuth && (
                <div className="space-y-4 rounded-md border border-border p-4">
                  <FormField
                    control={form.control}
                    name="authUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username for authentication" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password for authentication"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={sqlScanMutation.isPending}
                >
                  {sqlScanMutation.isPending ? (
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
                  disabled={sqlScanMutation.isPending}
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
            Scan Results
          </CardTitle>
          <CardDescription>
            Live output from the SQL injection scanner
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

            {sqlScanMutation.isPending && (
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
  );
}