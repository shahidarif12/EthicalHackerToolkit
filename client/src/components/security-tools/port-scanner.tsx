import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PortScanResult, ScanResult } from "@/types/security";
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

const formSchema = z.object({
  target: z.string().min(1, "Target is required"),
  ports: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const COMMON_SERVICES: Record<number, string> = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  443: "HTTPS",
  3306: "MySQL",
  5432: "PostgreSQL",
  8080: "HTTP-Proxy",
  8443: "HTTPS-Alt",
};

export function PortScanner() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [terminalOutput, setTerminalOutput] = useState({
    lines: [
      { 
        text: "Port Scanner Ready", 
        type: "info" as const 
      },
      {
        text: "Enter a target to scan common ports",
        type: "info" as const
      }
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: "",
      ports: "21,22,23,25,53,80,110,143,443,3306,5432,8080",
    },
  });

  const portScanMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const portsArray = values.ports 
        ? values.ports.split(",").map(p => parseInt(p.trim())).filter(p => !isNaN(p))
        : undefined;
        
      updateTerminal({ text: `Running port scan for ${values.target}...`, type: "info" });
      updateTerminal({ 
        text: `nmap -sT -p ${values.ports || "common"} ${values.target}`, 
        type: "command" 
      });
      
      const res = await apiRequest("POST", "/api/tools/port-scan", {
        target: values.target,
        ports: portsArray,
      });
      return res.json();
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);
      
      const scanResult = data.results as PortScanResult;
      
      if (scanResult.error) {
        updateTerminal({ text: `Error: ${scanResult.error}`, type: "error" });
        return;
      }
      
      updateTerminal({ text: "Starting Nmap scan...", type: "output" });
      updateTerminal({ text: `Scanning ${form.getValues().target}`, type: "output" });
      
      if (scanResult.openPorts.length === 0) {
        updateTerminal({ text: "No open ports found", type: "warning" });
      } else {
        updateTerminal({ text: "Open ports:", type: "info" });
        scanResult.openPorts.forEach(port => {
          const service = COMMON_SERVICES[port] || "unknown";
          updateTerminal({ 
            text: `${port}/tcp open  ${service}`, 
            type: "output" 
          });
        });
      }
      
      updateTerminal({ text: "Port scan completed", type: "success" });
      updateTerminal({ 
        text: `Found ${scanResult.openPorts.length} open ports`, 
        type: scanResult.openPorts.length > 0 ? "warning" : "success" 
      });
      
      toast({
        title: "Port Scan Complete",
        description: `Found ${scanResult.openPorts.length} open ports on ${form.getValues().target}.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });
      
      toast({
        title: "Port Scan Failed",
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
    portScanMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <FormControl>
                      <Input placeholder="example.com or IP address" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a domain or IP address to scan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ports (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="21,22,80,443" {...field} />
                    </FormControl>
                    <FormDescription>
                      Common ports are scanned by default. Customize if needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={portScanMutation.isPending}
                className="w-full"
              >
                {portScanMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Scan Ports
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Terminal output={terminalOutput} className="h-60" />

      {result && (
        <ScanResultComponent
          title="Port Scan Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().target}
          scanType="reconnaissance"
        >
          <div className="space-y-4">
            {(() => {
              const portResult = result.results as PortScanResult;
              if (portResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    <p className="font-medium">Error occurred:</p>
                    <p>{portResult.error}</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <h3 className="text-lg font-medium">Scan Summary:</h3>
                    <Badge 
                      variant={portResult.openPorts.length > 0 ? "destructive" : "default"}
                      className="ml-2"
                    >
                      {portResult.openPorts.length} Open Port(s)
                    </Badge>
                  </div>

                  {portResult.openPorts.length === 0 ? (
                    <div className="bg-muted p-4 rounded-md text-center">
                      No open ports were found on the target.
                    </div>
                  ) : (
                    <div className="bg-muted rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted-foreground/10 text-left">
                            <th className="py-2 px-4 font-medium">Port</th>
                            <th className="py-2 px-4 font-medium">Service</th>
                            <th className="py-2 px-4 font-medium">State</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portResult.openPorts.map((port, index) => (
                            <tr key={index} className="border-t border-muted-foreground/20">
                              <td className="py-2 px-4">{port}</td>
                              <td className="py-2 px-4">{COMMON_SERVICES[port] || "unknown"}</td>
                              <td className="py-2 px-4">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Open
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground mt-4">
                    <p>
                      <strong>Note:</strong> This is a basic port scan. For more comprehensive scanning, consider using dedicated tools like Nmap.
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
