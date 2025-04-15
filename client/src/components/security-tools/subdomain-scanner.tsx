import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScanResult } from "@/types/security";
import { Loader2, Search } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScanResult as ScanResultComponent } from "@/components/ui/scan-result";
import { Terminal } from "@/components/ui/terminal-output";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubdomainScanResult {
  subdomains: Array<{
    subdomain: string;
    ip?: string;
    status?: string;
  }>;
  error: string | null;
}

const formSchema = z.object({
  domain: z.string().min(1, "Domain is required")
    .regex(/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/, 
      "Please enter a valid domain (e.g., example.com)"),
});

type FormValues = z.infer<typeof formSchema>;

export function SubdomainScanner() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  type TerminalLine = {
    text: string;
    type: "info" | "success" | "error" | "warning" | "command" | "output";
  };
  
  const [terminalOutput, setTerminalOutput] = useState<{lines: TerminalLine[]}>({
    lines: [
      { 
        text: "Subdomain Scanner Ready", 
        type: "info"
      },
      {
        text: "Enter a domain to discover subdomains",
        type: "info"
      }
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
    },
  });

  const subdomainScanMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Starting subdomain scan for ${values.domain}...`, type: "info" });
      updateTerminal({ text: `using passive recon techniques to find subdomains...`, type: "command" });
      
      // In a production app, this would be a real API endpoint
      // Here we'll simulate a response with mock data
      // This would be replaced with a real API call:
      // const res = await apiRequest("POST", "/api/tools/subdomain-scan", { domain: values.domain });
      
      // Simulated response - remove this in production and use the real API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      const mockSubdomains = [
        { subdomain: `www.${values.domain}`, ip: "93.184.216.34", status: "active" },
        { subdomain: `mail.${values.domain}`, ip: "93.184.216.35", status: "active" },
        { subdomain: `api.${values.domain}`, ip: "93.184.216.36", status: "active" },
        { subdomain: `blog.${values.domain}`, ip: "93.184.216.37", status: "active" },
        { subdomain: `dev.${values.domain}`, ip: "93.184.216.38", status: "inactive" },
        { subdomain: `stage.${values.domain}`, ip: "93.184.216.39", status: "inactive" },
        { subdomain: `admin.${values.domain}`, ip: "93.184.216.40", status: "active" },
        { subdomain: `cdn.${values.domain}`, ip: "93.184.216.41", status: "active" },
      ];
      
      const mockResponse = {
        scanId: Math.floor(Math.random() * 1000) + 1,
        results: {
          subdomains: mockSubdomains,
          error: null
        }
      };
      
      return mockResponse;
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);
      
      const scanResult = data.results as SubdomainScanResult;
      
      if (scanResult.error) {
        updateTerminal({ text: `Error: ${scanResult.error}`, type: "error" });
        return;
      }
      
      updateTerminal({ 
        text: `Found ${scanResult.subdomains.length} subdomains for ${form.getValues().domain}`, 
        type: "success" 
      });
      
      scanResult.subdomains.forEach(sub => {
        updateTerminal({ 
          text: `${sub.subdomain} ${sub.ip ? `(${sub.ip})` : ''} - ${sub.status === 'active' ? 'Active' : 'Inactive'}`, 
          type: sub.status === 'active' ? "output" : "warning" 
        });
      });
      
      updateTerminal({ text: "Subdomain scan completed", type: "success" });
      
      toast({
        title: "Subdomain Scan Complete",
        description: `Found ${scanResult.subdomains.length} subdomains.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });
      
      toast({
        title: "Subdomain Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function updateTerminal(line: { text: string; type: "info" | "success" | "error" | "warning" | "command" | "output" }) {
    setTerminalOutput(prev => ({
      lines: [...prev.lines, line]
    }));
  }

  function onSubmit(values: FormValues) {
    subdomainScanMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end gap-2"
            >
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <Input placeholder="example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a root domain to scan for subdomains.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={subdomainScanMutation.isPending}
                className="mb-[2px]"
              >
                {subdomainScanMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Scan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Terminal output={terminalOutput} className="h-60" />

      {result && (
        <ScanResultComponent
          title="Subdomain Scan Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().domain}
          scanType="reconnaissance"
        >
          <div className="space-y-6">
            {(() => {
              const scanResult = result.results as SubdomainScanResult;
              if (scanResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md dark:bg-red-900/20 dark:text-red-300">
                    <p className="font-medium">Error occurred:</p>
                    <p>{scanResult.error}</p>
                  </div>
                );
              }

              const activeSubdomains = scanResult.subdomains.filter(sub => sub.status === 'active');
              const inactiveSubdomains = scanResult.subdomains.filter(sub => sub.status !== 'active');

              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Discovered Subdomains</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {activeSubdomains.length} Active
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        {inactiveSubdomains.length} Inactive
                      </Badge>
                    </div>
                  </div>

                  {scanResult.subdomains.length === 0 ? (
                    <div className="text-center py-6 bg-muted rounded-md">
                      <p>No subdomains found for this domain.</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subdomain</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scanResult.subdomains.map((subdomain, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium font-mono">
                                {subdomain.subdomain}
                              </TableCell>
                              <TableCell>{subdomain.ip || "Unknown"}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={subdomain.status === 'active' ? 'default' : 'outline'}
                                  className={subdomain.status === 'active' 
                                    ? 'bg-green-600' 
                                    : 'text-yellow-600 border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400'
                                  }
                                >
                                  {subdomain.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Note:</strong> This scan uses passive reconnaissance techniques to identify potential subdomains. For a more comprehensive scan, consider using active techniques (requires proper authorization).
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </ScanResultComponent>
      )}
    </div>
  );
}