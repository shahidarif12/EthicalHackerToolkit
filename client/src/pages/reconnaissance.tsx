import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DnsLookup } from "@/components/security-tools/dns-lookup";
import { Whois } from "@/components/security-tools/whois";
import { PortScanner } from "@/components/security-tools/port-scanner";
import { TechScanner } from "@/components/security-tools/tech-scanner";
import { SubdomainScanner } from "@/components/security-tools/subdomain-scanner";
import { SSLScanner } from "@/components/security-tools/ssl-scanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReconnaissancePage() {
  const [activeTab, setActiveTab] = useState("dns");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Reconnaissance Tools</h1>
          <p className="text-muted-foreground">
            Discover and analyze information about targets with these passive reconnaissance tools.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About Reconnaissance</CardTitle>
            <CardDescription>
              Reconnaissance is the first phase of security testing, where information about the target is gathered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The tools on this page help you collect information about domains, networks, and web applications without directly interacting with the systems in ways that might be detected as suspicious. This includes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>DNS information (A records, MX records, NS records)</li>
              <li>WHOIS registration data</li>
              <li>Subdomain discovery</li>
              <li>SSL/TLS certificate analysis</li>
              <li>Open port scanning</li>
              <li>Technology detection</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Note: Always ensure you have permission to scan the target. Unauthorized scanning may be illegal in some jurisdictions.
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="dns">DNS Lookup</TabsTrigger>
            <TabsTrigger value="whois">WHOIS</TabsTrigger>
            <TabsTrigger value="subdomain">Subdomains</TabsTrigger>
            <TabsTrigger value="ssl">SSL Analysis</TabsTrigger>
            <TabsTrigger value="port">Port Scanner</TabsTrigger>
            <TabsTrigger value="tech">Tech Scanner</TabsTrigger>
          </TabsList>

          <TabsContent value="dns" className="space-y-4">
            <DnsLookup />
          </TabsContent>

          <TabsContent value="whois" className="space-y-4">
            <Whois />
          </TabsContent>
          
          <TabsContent value="subdomain" className="space-y-4">
            <SubdomainScanner />
          </TabsContent>
          
          <TabsContent value="ssl" className="space-y-4">
            <SSLScanner />
          </TabsContent>

          <TabsContent value="port" className="space-y-4">
            <PortScanner />
          </TabsContent>

          <TabsContent value="tech" className="space-y-4">
            <TechScanner />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
