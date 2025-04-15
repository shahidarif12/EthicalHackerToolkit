import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TechScanResult, ScanResult } from "@/types/security";
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
  url: z.string().url("Please enter a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

export function TechScanner() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [terminalOutput, setTerminalOutput] = useState({
    lines: [
      { 
        text: "Technology Scanner Ready", 
        type: "info" as const 
      },
      {
        text: "Enter a URL to scan for web technologies",
        type: "info" as const
      }
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const techScanMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({ text: `Scanning technologies on ${values.url}...`, type: "info" });
      updateTerminal({ text: `curl -s -I -L ${values.url}`, type: "command" });
      
      const res = await apiRequest("POST", "/api/tools/tech-scan", {
        url: values.url,
      });
      return res.json();
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);
      
      const techResult = data.results as TechScanResult;
      
      if (techResult.error) {
        updateTerminal({ text: `Error: ${techResult.error}`, type: "error" });
        return;
      }
      
      // Show headers in terminal
      updateTerminal({ text: "# HTTP Headers", type: "info" });
      Object.entries(techResult.headers).forEach(([key, value]) => {
        updateTerminal({ text: `${key}: ${value}`, type: "output" });
      });
      
      // Show detected technologies
      if (techResult.technologies.length > 0) {
        updateTerminal({ text: "# Detected Technologies", type: "info" });
        techResult.technologies.forEach(tech => {
          updateTerminal({ text: tech, type: "output" });
        });
      } else {
        updateTerminal({ text: "No technologies detected", type: "warning" });
      }
      
      updateTerminal({ text: "Technology scan completed", type: "success" });
      
      toast({
        title: "Technology Scan Complete",
        description: `Found ${techResult.technologies.length} technologies on ${form.getValues().url}.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });
      
      toast({
        title: "Technology Scan Failed",
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
    techScanMutation.mutate(values);
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
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to scan for web technologies.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={techScanMutation.isPending}
                className="mb-[2px]"
              >
                {techScanMutation.isPending ? (
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
          title="Technology Scan Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().url}
          scanType="reconnaissance"
        >
          <div className="space-y-6">
            {(() => {
              const techResult = result.results as TechScanResult;
              if (techResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    <p className="font-medium">Error occurred:</p>
                    <p>{techResult.error}</p>
                  </div>
                );
              }

              return (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Detected Technologies</h3>
                    {techResult.technologies.length === 0 ? (
                      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                        No technologies were detected. The site may be using technologies we cannot detect automatically.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {techResult.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">HTTP Headers</h3>
                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-muted-foreground/20">
                            <th className="py-2 text-left font-medium">Header</th>
                            <th className="py-2 text-left font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(techResult.headers).map(([key, value], index) => (
                            <tr key={index} className="border-b border-muted-foreground/10">
                              <td className="py-2 pr-4 font-mono whitespace-nowrap">{key}</td>
                              <td className="py-2 font-mono break-all">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </ScanResultComponent>
      )}
    </div>
  );
}
