import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DnsLookupResult, ScanResult } from "@/types/security";
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

const formSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function DnsLookup() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [terminalOutput, setTerminalOutput] = useState({
    lines: [
      { 
        text: "DNS Lookup Tool Ready", 
        type: "info" as const 
      },
      {
        text: "Enter a domain to perform a DNS lookup",
        type: "info" as const
      }
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
    },
  });

  const dnsLookupMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Running DNS lookup for ${values.domain}...`, type: "info" });
      updateTerminal({ text: `dig ${values.domain} +short`, type: "command" });
      
      const res = await apiRequest("POST", "/api/tools/dns-lookup", {
        domain: values.domain,
      });
      return res.json();
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);
      
      const dnsResult = data.results as DnsLookupResult;
      
      if (dnsResult.error) {
        updateTerminal({ text: `Error: ${dnsResult.error}`, type: "error" });
        return;
      }
      
      if (dnsResult.addressInfo) {
        updateTerminal({ text: dnsResult.addressInfo.address, type: "output" });
      }
      
      if (dnsResult.mxRecords && dnsResult.mxRecords.length > 0) {
        updateTerminal({ text: "# MX Records", type: "info" });
        dnsResult.mxRecords.forEach(mx => {
          updateTerminal({ 
            text: `${mx.exchange} (priority: ${mx.priority})`, 
            type: "output" 
          });
        });
      }
      
      if (dnsResult.nsRecords && dnsResult.nsRecords.length > 0) {
        updateTerminal({ text: "# NS Records", type: "info" });
        dnsResult.nsRecords.forEach(ns => {
          updateTerminal({ text: ns, type: "output" });
        });
      }
      
      if (dnsResult.txtRecords && dnsResult.txtRecords.length > 0) {
        updateTerminal({ text: "# TXT Records", type: "info" });
        dnsResult.txtRecords.forEach(txt => {
          updateTerminal({ text: txt, type: "output" });
        });
      }
      
      updateTerminal({ text: "DNS lookup completed successfully", type: "success" });
      
      toast({
        title: "DNS Lookup Complete",
        description: `Results for ${form.getValues().domain} have been retrieved.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });
      
      toast({
        title: "DNS Lookup Failed",
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
    dnsLookupMutation.mutate(values);
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
                      Enter a domain to lookup DNS information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={dnsLookupMutation.isPending}
                className="mb-[2px]"
              >
                {dnsLookupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Lookup
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Terminal output={terminalOutput} className="h-60" />

      {result && (
        <ScanResultComponent
          title="DNS Lookup Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().domain}
          scanType="reconnaissance"
        >
          <div className="space-y-4">
            {(() => {
              const dnsResult = result.results as DnsLookupResult;
              if (dnsResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    <p className="font-medium">Error occurred:</p>
                    <p>{dnsResult.error}</p>
                  </div>
                );
              }

              return (
                <>
                  {dnsResult.addressInfo && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">IP Address</h3>
                      <div className="bg-muted p-2 rounded-md font-mono">
                        {dnsResult.addressInfo.address} (IPv{dnsResult.addressInfo.family})
                      </div>
                    </div>
                  )}

                  {dnsResult.mxRecords && dnsResult.mxRecords.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">MX Records</h3>
                      <div className="bg-muted p-2 rounded-md font-mono">
                        <ul className="space-y-1">
                          {dnsResult.mxRecords.map((record, index) => (
                            <li key={index}>
                              {record.exchange} (priority: {record.priority})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {dnsResult.nsRecords && dnsResult.nsRecords.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">NS Records</h3>
                      <div className="bg-muted p-2 rounded-md font-mono">
                        <ul className="space-y-1">
                          {dnsResult.nsRecords.map((record, index) => (
                            <li key={index}>{record}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {dnsResult.txtRecords && dnsResult.txtRecords.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">TXT Records</h3>
                      <div className="bg-muted p-2 rounded-md font-mono overflow-x-auto max-h-40">
                        <ul className="space-y-1">
                          {dnsResult.txtRecords.map((record, index) => (
                            <li key={index} className="break-all">{record}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </ScanResultComponent>
      )}
    </div>
  );
}
