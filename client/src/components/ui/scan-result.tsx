import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Check, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScanResultProps {
  title: string;
  timestamp: string;
  scanId: number;
  target: string;
  scanType: string;
  children: React.ReactNode;
}

export function ScanResult({
  title,
  timestamp,
  scanId,
  target,
  scanType,
  children,
}: ScanResultProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleCopyToClipboard = () => {
    // Get all text content from the card
    const cardContent = document.getElementById(`scan-result-${scanId}`)?.textContent || "";
    
    navigator.clipboard.writeText(cardContent).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "The scan result has been copied to your clipboard.",
        });
        
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      },
      (err) => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard: " + err,
          variant: "destructive",
        });
      }
    );
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      const scan = await (await apiRequest("GET", `/api/scans/${scanId}`)).json();
      
      const report = await (await apiRequest("POST", "/api/reports", {
        scanId,
        reportData: {
          scan,
          generatedAt: new Date().toISOString(),
          target,
          scanType
        }
      })).json();
      
      toast({
        title: "Report generated",
        description: `Report ID: ${report.id} has been created.`,
      });
    } catch (error: any) {
      toast({
        title: "Report generation failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getScanTypeBadgeColor = (type: string) => {
    switch (type) {
      case "reconnaissance":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "vulnerability":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "web-automation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card id={`scan-result-${scanId}`} className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>
              Scan ID: {scanId} | {timestamp}
            </CardDescription>
          </div>
          <Badge className={cn("ml-2", getScanTypeBadgeColor(scanType))}>
            {scanType.charAt(0).toUpperCase() + scanType.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center mt-2">
          <Info className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Target: {target}
          </span>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyToClipboard}
          disabled={isCopied}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </>
          )}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={generateReport}
          disabled={isGeneratingReport}
        >
          {isGeneratingReport ? (
            <>
              <span className="animate-spin mr-1">⏳</span> Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1" /> Generate Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
