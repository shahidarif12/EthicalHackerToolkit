import { Layout } from "@/components/layout/layout";
import { WebAutomationTool } from "@/components/security-tools/web-automation-tool";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function WebAutomationPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Web Automation</h1>
          <p className="text-muted-foreground">
            Analyze web page elements and forms for testing and scraping.
          </p>
        </div>

        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Tool Purpose</AlertTitle>
          <AlertDescription>
            This tool helps you analyze forms and DOM elements on web pages, which can be useful for 
            preparing security tests, understanding input validation requirements, and planning automation scripts.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>About Web Automation</CardTitle>
            <CardDescription>
              Web automation provides insights into the structure of web applications to help with security testing and form analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This tool examines web pages and provides information about:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>HTML forms and their input fields</li>
              <li>Required fields and validation attributes</li>
              <li>Form submission methods and targets</li>
              <li>Custom DOM elements via CSS selectors</li>
            </ul>
            <p className="mt-2">
              The information gathered can be used to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Plan automated testing strategies</li>
              <li>Identify potential input validation bypasses</li>
              <li>Prepare for more targeted security tests</li>
              <li>Understand the application's client-side structure</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Note: This is a basic analysis tool. More complex automation may require specialized testing frameworks.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <WebAutomationTool />
        </div>
      </div>
    </Layout>
  );
}
