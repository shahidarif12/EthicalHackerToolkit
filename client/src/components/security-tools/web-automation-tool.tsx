import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WebAutomationResult, ScanResult } from "@/types/security";
import { Loader2, Search, Plus, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  selectors: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WebAutomationTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectors, setSelectors] = useState<string[]>([]);
  const [selectorInput, setSelectorInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState({
    lines: [
      {
        text: "Web Automation Tool Ready",
        type: "info" as const,
      },
      {
        text: "Enter a URL to analyze forms and elements",
        type: "info" as const,
      },
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      selectors: [],
    },
  });

  const addSelector = () => {
    if (selectorInput.trim()) {
      setSelectors([...selectors, selectorInput.trim()]);
      setSelectorInput("");
    }
  };

  const removeSelector = (index: number) => {
    const newSelectors = [...selectors];
    newSelectors.splice(index, 1);
    setSelectors(newSelectors);
  };

  const webAutomationMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      updateTerminal({
        text: `Starting web automation analysis on ${values.url}...`,
        type: "info",
      });
      updateTerminal({
        text: `analyzing DOM elements and forms...`,
        type: "command",
      });

      const res = await apiRequest("POST", "/api/tools/web-automation", {
        url: values.url,
        selectors: selectors.length > 0 ? selectors : undefined,
      });
      return res.json();
    },
    onSuccess: (data: ScanResult) => {
      setResult(data);

      const autoResult = data.results as WebAutomationResult;

      if (autoResult.error) {
        updateTerminal({ text: `Error: ${autoResult.error}`, type: "error" });
        return;
      }

      // Show element counts
      if (autoResult.elements.length > 0) {
        updateTerminal({
          text: "# Element Selectors Analysis",
          type: "info",
        });
        autoResult.elements.forEach((element) => {
          if (element.error) {
            updateTerminal({
              text: `Selector: ${element.selector} - Error: ${element.error}`,
              type: "error",
            });
          } else {
            updateTerminal({
              text: `Selector: ${element.selector} - Found ${element.count} elements`,
              type: element.found ? "success" : "warning",
            });
          }
        });
      }

      // Show forms
      if (autoResult.forms.length > 0) {
        updateTerminal({
          text: `# Found ${autoResult.forms.length} forms on the page`,
          type: "info",
        });
        autoResult.forms.forEach((form, index) => {
          updateTerminal({
            text: `Form #${index + 1}: ${form.id || "unnamed"} (${form.method} ${
              form.action || "current page"
            })`,
            type: "output",
          });
          updateTerminal({
            text: `Contains ${form.inputs.length} input fields`,
            type: "output",
          });
        });
      } else {
        updateTerminal({
          text: "No forms found on the page",
          type: "warning",
        });
      }

      updateTerminal({ text: "Web automation analysis completed", type: "success" });

      toast({
        title: "Web Automation Analysis Complete",
        description: `Analyzed ${autoResult.forms.length} forms and ${selectors.length} custom selectors.`,
      });
    },
    onError: (error: Error) => {
      updateTerminal({ text: `Error: ${error.message}`, type: "error" });

      toast({
        title: "Web Automation Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function updateTerminal(line: {
    text: string;
    type: "info" | "success" | "error" | "warning" | "command" | "output";
  }) {
    setTerminalOutput((prev) => ({
      lines: [...prev.lines, line],
    }));
  }

  function onSubmit(values: FormValues) {
    values.selectors = selectors;
    webAutomationMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to analyze forms and DOM elements.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel htmlFor="selectors">CSS Selectors (Optional)</FormLabel>
                <div className="flex gap-2">
                  <Input
                    id="selectors"
                    placeholder="e.g. .form-group, #submit-button"
                    value={selectorInput}
                    onChange={(e) => setSelectorInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSelector}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Add specific CSS selectors to target elements on the page.
                </FormDescription>

                {selectors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectors.map((selector, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span className="font-mono">{selector}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeSelector(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={webAutomationMutation.isPending}
                className="w-full"
              >
                {webAutomationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Analyze Page
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Terminal output={terminalOutput} className="h-60" />

      {result && (
        <ScanResultComponent
          title="Web Automation Analysis Results"
          timestamp={new Date().toLocaleString()}
          scanId={result.scanId}
          target={form.getValues().url}
          scanType="web-automation"
        >
          <div className="space-y-6">
            {(() => {
              const autoResult = result.results as WebAutomationResult;
              if (autoResult.error) {
                return (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md dark:bg-red-900/20 dark:text-red-300">
                    <p className="font-medium">Error occurred:</p>
                    <p>{autoResult.error}</p>
                  </div>
                );
              }

              return (
                <Tabs defaultValue="forms">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forms">
                      Forms ({autoResult.forms.length})
                    </TabsTrigger>
                    <TabsTrigger value="elements">
                      CSS Selectors ({autoResult.elements.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="forms" className="mt-4 space-y-4">
                    {autoResult.forms.length === 0 ? (
                      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md dark:bg-yellow-900/20 dark:text-yellow-300">
                        No forms were detected on this page.
                      </div>
                    ) : (
                      autoResult.forms.map((form, formIndex) => (
                        <Card key={formIndex} className="overflow-hidden">
                          <div className="bg-muted p-3 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {form.id ? `Form: ${form.id}` : `Form #${formIndex + 1}`}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Method: {form.method.toUpperCase()} | Action:{" "}
                                  {form.action || "Current Page"}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {form.inputs.length} Input{form.inputs.length !== 1 && "s"}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>ID</TableHead>
                                  <TableHead className="text-center">Required</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {form.inputs.map((input, inputIndex) => (
                                  <TableRow key={inputIndex}>
                                    <TableCell className="font-mono text-sm">
                                      {input.name || <span className="text-muted-foreground">(unnamed)</span>}
                                    </TableCell>
                                    <TableCell>{input.type}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                      {input.id || <span className="text-muted-foreground">(no id)</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {input.required ? (
                                        <Badge variant="default" className="bg-green-600">
                                          Yes
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">No</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="elements" className="mt-4 space-y-4">
                    {autoResult.elements.length === 0 ? (
                      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md dark:bg-yellow-900/20 dark:text-yellow-300">
                        No custom selectors were analyzed.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/2">Selector</TableHead>
                            <TableHead>Count</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {autoResult.elements.map((element, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">
                                {element.selector}
                              </TableCell>
                              <TableCell>{element.count}</TableCell>
                              <TableCell>
                                {element.error ? (
                                  <Badge variant="destructive" className="gap-1">
                                    <span className="text-xs">Error</span>
                                  </Badge>
                                ) : element.found ? (
                                  <Badge variant="default" className="bg-green-600 gap-1">
                                    <span className="text-xs">Found</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="gap-1">
                                    <span className="text-xs">Not Found</span>
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>
              );
            })()}
          </div>
        </ScanResultComponent>
      )}
    </div>
  );
}
