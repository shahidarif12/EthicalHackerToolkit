import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WhoisResult, ScanResult } from "@/types/security";
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

export function Whois() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [terminalOutput, setTerminalOutput] = useState({
    lines: [
      { 
        text: "WHOIS Lookup Tool Ready", 
        type: "info" as const 
      },
      {
        text: "Enter a domain to perform a WHOIS lookup",
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

  const whoisMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Running WHOIS lookup for ${values.domain}...`, type: "info" });
      updateTerminal({ text: `whois ${values.domain}`, type: "command" });
      
      const res = await apiRequest("POST", "/api/tools/whois", {
        domain: values.domain,
      });
      return res.json();
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);
      
      const whoisResult = data.results as WhoisResult;
      
      if (whoisResult.error) {
        updateTerminal({ text: `Error: ${whoisResult.error}`, type: "error" });
        return;
      }
      
      if (whoisResult.whoisResults) {
        // Show some important WHOIS information in the terminal
        updateTerminal({ text: "# WHOIS Information", type: "info" });
        
        if (whoisResult.whoisResults.domainName) {
          updateTerminal({ text: `Domain Name: ${whoisResult.whoisResults.domainName}`, type: "output" });
        }
        
        if (whoisResult.whoisResults.registrar) {
          updateTerminal({ text: `Registrar: ${whoisResult.whoisResults.registrar}`, type: "output" });
        }
        
        if (whoisResult.whoisResults.creationDate) {
          updateTerminal({ text: `Creation Date: ${whoisResult.whoisResults.creationDate}`, type: "output" });
        }
        
        if (whoisResult.whoisResults.expirationDate) {
          updateTerminal({ text: `Expiration Date: ${whoisResult.whoisResults.expirationDate}`, type: "output" });
        }
        
        if (whoisResult.whoisResults.nameServers) {
          updateTerminal({ text: `Name Servers: ${whoisResult.whoisResults.nameServers}`, type: "output" });
        }
      }
      
      updateTerminal({ text: "WHOIS lookup completed successfully", type: "success" });
      
      toast({
        title: "WHOIS Lookup Complete",
        description: `Results for ${form.getValues().domain} have been retrieved.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });
      
      toast({
        title: "WHOIS Lookup Failed",
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
    whoisMutation.mutate(values);
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
                      Enter a domain to lookup WHOIS information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={whoisMutation.isPending}
                className="mb-[2px]"
              >
                {whoisMutation.isPending ? (
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
          title="WHOIS Lookup Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().domain}
          scanType="reconnaissance"
        >
          <div className="space-y-4">
            {(() => {
              const whoisResult = result.results as WhoisResult;
              if (whoisResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    <p className="font-medium">Error occurred:</p>
                    <p>{whoisResult.error}</p>
                  </div>
                );
              }

              if (!whoisResult.whoisResults) {
                return (
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                    No WHOIS data available for this domain.
                  </div>
                );
              }

              // Get all the entries in the WHOIS results
              const entries = Object.entries(whoisResult.whoisResults);
              
              return (
                <div className="space-y-2">
                  <div className="bg-muted p-4 rounded-md font-mono overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <tbody>
                        {entries.map(([key, value], index) => (
                          <tr key={index} className="border-b border-muted-foreground/20">
                            <td className="py-1.5 pr-4 font-medium whitespace-nowrap">{key}:</td>
                            <td className="py-1.5 break-all">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
