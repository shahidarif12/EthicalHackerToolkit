import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScanResult } from "@/types/security";
import { Loader2, Search, Shield, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SSLScanResult {
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  cipherSuite: string;
  keyStrength: number;
  vulnerabilities: Array<{
    name: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
  certDetails: {
    serialNumber: string;
    fingerprint: string;
    subjectAltNames: string[];
  };
  error: string | null;
}

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL").refine(
    (url) => url.startsWith('https://'),
    {
      message: "URL must use HTTPS protocol",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function SSLScanner() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  type TerminalLine = {
    text: string;
    type: "info" | "success" | "error" | "warning" | "command" | "output";
  };
  
  const [terminalOutput, setTerminalOutput] = useState<{lines: TerminalLine[]}>({
    lines: [
      { 
        text: "SSL/TLS Certificate Scanner Ready", 
        type: "info"
      },
      {
        text: "Enter an HTTPS URL to analyze certificate and configuration",
        type: "info"
      }
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const sslScanMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Starting SSL/TLS scan for ${values.url}...`, type: "info" });
      updateTerminal({ text: `checking certificate validity and configuration...`, type: "command" });
      
      // In a production app, this would be a real API endpoint
      // Here we'll simulate a response with mock data
      // This would be replaced with a real API call:
      // const res = await apiRequest("POST", "/api/tools/ssl-scan", { url: values.url });
      
      // Simulated response - remove this in production and use the real API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      const domain = new URL(values.url).hostname;
      const today = new Date();
      const validFrom = new Date(today);
      validFrom.setDate(today.getDate() - 90); // 90 days ago
      const validTo = new Date(today);
      validTo.setDate(today.getDate() + 275); // 275 days in the future
      
      const mockResponse = {
        scanId: Math.floor(Math.random() * 1000) + 1,
        results: {
          valid: true,
          issuer: "DigiCert Inc",
          subject: domain,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining: 275,
          protocol: "TLSv1.3",
          cipherSuite: "TLS_AES_256_GCM_SHA384",
          keyStrength: 2048,
          vulnerabilities: [
            {
              name: "Certificate Transparency",
              severity: "low" as const,
              description: "Certificate is not logged in CT logs"
            }
          ],
          certDetails: {
            serialNumber: "0b14d145eb5a8e25a824f70228c93d31",
            fingerprint: "43:52:AC:B1:36:22:47:A1:7C:91:7F:B5:E4:3C:52:64:88:11:CF:21",
            subjectAltNames: [domain, `www.${domain}`]
          },
          error: null
        }
      };
      
      return mockResponse;
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);
      
      const sslResult = data.results as SSLScanResult;
      
      if (sslResult.error) {
        updateTerminal({ text: `Error: ${sslResult.error}`, type: "error" });
        return;
      }
      
      updateTerminal({ 
        text: `Certificate for ${form.getValues().url} is ${sslResult.valid ? 'valid' : 'invalid'}`, 
        type: sslResult.valid ? "success" : "error" 
      });
      
      updateTerminal({ 
        text: `Issued by: ${sslResult.issuer}`, 
        type: "output" 
      });
      
      updateTerminal({ 
        text: `Valid from: ${new Date(sslResult.validFrom).toLocaleDateString()} to ${new Date(sslResult.validTo).toLocaleDateString()}`, 
        type: "output" 
      });
      
      updateTerminal({ 
        text: `Days remaining: ${sslResult.daysRemaining}`, 
        type: sslResult.daysRemaining < 30 ? "warning" : "output" 
      });
      
      updateTerminal({ 
        text: `Protocol: ${sslResult.protocol}, Cipher: ${sslResult.cipherSuite}, Key Strength: ${sslResult.keyStrength} bits`, 
        type: "output" 
      });
      
      if (sslResult.vulnerabilities.length > 0) {
        updateTerminal({ 
          text: `Found ${sslResult.vulnerabilities.length} vulnerabilities/issues`, 
          type: "warning" 
        });
        
        sslResult.vulnerabilities.forEach(vuln => {
          updateTerminal({ 
            text: `[${vuln.severity.toUpperCase()}] ${vuln.name}`, 
            type: vuln.severity === "high" ? "error" : vuln.severity === "medium" ? "warning" : "info" 
          });
        });
      } else {
        updateTerminal({ 
          text: "No vulnerabilities detected", 
          type: "success" 
        });
      }
      
      updateTerminal({ text: "SSL/TLS scan completed", type: "success" });
      
      toast({
        title: "SSL/TLS Scan Complete",
        description: sslResult.valid 
          ? `Certificate is valid for ${sslResult.daysRemaining} more days.` 
          : "Certificate has issues. Check the detailed results.",
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });
      
      toast({
        title: "SSL/TLS Scan Failed",
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
    sslScanMutation.mutate(values);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>HTTPS URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter an HTTPS URL to analyze SSL/TLS certificate.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={sslScanMutation.isPending}
                className="mb-[2px]"
              >
                {sslScanMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
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
          title="SSL/TLS Certificate Scan Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().url}
          scanType="reconnaissance"
        >
          <div className="space-y-6">
            {(() => {
              const sslResult = result.results as SSLScanResult;
              if (sslResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md dark:bg-red-900/20 dark:text-red-300">
                    <p className="font-medium">Error occurred:</p>
                    <p>{sslResult.error}</p>
                  </div>
                );
              }

              return (
                <div>
                  <Alert variant={sslResult.valid ? "default" : "destructive"}>
                    {sslResult.valid ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    <AlertTitle>
                      {sslResult.valid ? "Certificate is Valid" : "Certificate Invalid or Has Issues"}
                    </AlertTitle>
                    <AlertDescription>
                      {sslResult.valid 
                        ? `The SSL certificate for this domain is valid and will expire in ${sslResult.daysRemaining} days.` 
                        : "There are issues with the SSL certificate for this domain. See details below."}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Certificate Details</h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Subject</dt>
                            <dd className="text-right">{sslResult.subject}</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Issuer</dt>
                            <dd className="text-right">{sslResult.issuer}</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Valid From</dt>
                            <dd className="text-right">{formatDate(sslResult.validFrom)}</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Valid Until</dt>
                            <dd className="text-right">{formatDate(sslResult.validTo)}</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Days Remaining</dt>
                            <dd className={`text-right ${sslResult.daysRemaining < 30 ? 'text-destructive' : ''}`}>
                              {sslResult.daysRemaining}
                            </dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Serial Number</dt>
                            <dd className="text-right font-mono text-xs overflow-hidden text-ellipsis">
                              {sslResult.certDetails.serialNumber}
                            </dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Fingerprint</dt>
                            <dd className="text-right font-mono text-xs overflow-hidden text-ellipsis">
                              {sslResult.certDetails.fingerprint}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Connection Security</h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Protocol</dt>
                            <dd className="text-right">
                              <Badge variant={sslResult.protocol.includes("TLSv1.2") || sslResult.protocol.includes("TLSv1.3") ? "default" : "destructive"}>
                                {sslResult.protocol}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Cipher Suite</dt>
                            <dd className="text-right font-mono text-xs">
                              {sslResult.cipherSuite}
                            </dd>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <dt className="font-medium">Key Strength</dt>
                            <dd className="text-right">
                              <Badge variant={sslResult.keyStrength >= 2048 ? "default" : "destructive"}>
                                {sslResult.keyStrength} bits
                              </Badge>
                            </dd>
                          </div>
                          <div className="py-1 border-b">
                            <dt className="font-medium mb-2">Subject Alternative Names</dt>
                            <dd className="mt-1 space-y-1">
                              {sslResult.certDetails.subjectAltNames.map((name, index) => (
                                <div key={index} className="font-mono text-xs bg-muted p-1 rounded">
                                  {name}
                                </div>
                              ))}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>

                  {sslResult.vulnerabilities.length > 0 && (
                    <Card className="mt-6">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium flex items-center mb-4">
                          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                          Vulnerabilities & Issues
                        </h3>
                        <div className="space-y-4">
                          {sslResult.vulnerabilities.map((vuln, index) => (
                            <Alert 
                              key={index} 
                              variant={
                                vuln.severity === 'high' 
                                  ? "destructive" 
                                  : vuln.severity === 'medium' 
                                    ? "default" 
                                    : "default"
                              }
                            >
                              <AlertTitle className="flex items-center gap-2">
                                {vuln.name}
                                <Badge 
                                  variant="outline" 
                                  className={
                                    vuln.severity === 'high' 
                                      ? "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300" 
                                      : vuln.severity === 'medium' 
                                        ? "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" 
                                        : "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                  }
                                >
                                  {vuln.severity.toUpperCase()}
                                </Badge>
                              </AlertTitle>
                              <AlertDescription>
                                {vuln.description}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Note:</strong> This scan checks certificate validity, protocol versions, and common SSL/TLS misconfigurations. For a more comprehensive security assessment, consider a full vulnerability scan.
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