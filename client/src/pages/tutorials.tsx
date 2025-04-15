import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, FileText, Video, Code, Shield, Search, Bug } from "lucide-react";

export default function TutorialsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tutorials & Documentation</h1>
          <p className="text-muted-foreground">
            Learn about security testing techniques and how to use the platform.
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="recon">Reconnaissance</TabsTrigger>
            <TabsTrigger value="vuln">Vulnerability Testing</TabsTrigger>
            <TabsTrigger value="automation">Web Automation</TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to SecureTest Platform</CardTitle>
                <CardDescription>
                  Learn the basics of security testing and get started with the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Platform Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        A comprehensive overview of the SecureTest platform features and capabilities.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Read Guide
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Video Walkthrough
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        Watch a complete walkthrough of all the main features.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Watch Video
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Basic Concepts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        Learn the fundamental concepts of security testing.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-medium mb-2">Quick Start Guide</h3>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-medium">
                        1
                      </div>
                      <div className="ml-4">
                        <h4 className="text-base font-medium">Create an account</h4>
                        <p className="text-sm text-muted-foreground">
                          Sign up for a new account or log in if you already have one.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-medium">
                        2
                      </div>
                      <div className="ml-4">
                        <h4 className="text-base font-medium">Choose a security tool</h4>
                        <p className="text-sm text-muted-foreground">
                          Select from reconnaissance, vulnerability scanning, or web automation tools.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-medium">
                        3
                      </div>
                      <div className="ml-4">
                        <h4 className="text-base font-medium">Enter a target</h4>
                        <p className="text-sm text-muted-foreground">
                          Specify the domain or URL you want to test. Make sure you have permission to scan it.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-medium">
                        4
                      </div>
                      <div className="ml-4">
                        <h4 className="text-base font-medium">Review and analyze results</h4>
                        <p className="text-sm text-muted-foreground">
                          Examine the findings and generate reports for documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reconnaissance Tab */}
          <TabsContent value="recon" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reconnaissance Techniques</CardTitle>
                <CardDescription>
                  Learn how to gather information about your targets effectively.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">DNS Lookup</h3>
                    </div>
                    <p>
                      DNS lookups allow you to discover the IP addresses, mail servers, 
                      and other DNS records associated with a domain. This information
                      is critical for mapping network infrastructure.
                    </p>
                    <div className="rounded-md bg-muted p-4 font-mono text-sm">
                      <p># Basic DNS Lookup</p>
                      <p>$ dig example.com</p>
                      <p># Mail Server Records</p>
                      <p>$ dig example.com MX</p>
                      <p># Name Server Records</p>
                      <p>$ dig example.com NS</p>
                    </div>
                    <Button variant="outline" className="mt-2">
                      DNS Lookup Tutorial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                      <h3 className="text-lg font-medium">WHOIS Lookup</h3>
                    </div>
                    <p>
                      WHOIS lookups provide domain registration information, including
                      owner details (if not private), registration dates, and
                      registrar information. This can be valuable for understanding a domain's history.
                    </p>
                    <div className="rounded-md bg-muted p-4 font-mono text-sm">
                      <p># Basic WHOIS Query</p>
                      <p>$ whois example.com</p>
                      <p># Registrar Information</p>
                      <p>$ whois -r example.com</p>
                    </div>
                    <Button variant="outline" className="mt-2">
                      WHOIS Tutorial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Best Practices for Reconnaissance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full bg-primary/10 p-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8V3h-5l2.26 2.26A9 9 0 0 0 12 3a9 9 0 0 0-9 9h3a6 6 0 1 1 6 6c-3.3 0-6-2.7-6-6H3a9 9 0 0 0 9 9 9 9 0 0 0 0-18"></path></svg>
                          </div>
                          <h4 className="font-medium">Perform Passive Recon First</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Always begin with non-intrusive techniques that don't interact directly with the target.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full bg-primary/10 p-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m14.5 9-5 5"></path><path d="m9.5 9 5 5"></path></svg>
                          </div>
                          <h4 className="font-medium">Document Everything</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Keep detailed records of all information gathered for later analysis.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full bg-primary/10 p-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z"></path><path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z"></path><path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z"></path></svg>
                          </div>
                          <h4 className="font-medium">Stay Legal and Ethical</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Always obtain permission before scanning and respect privacy laws.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vulnerability Testing Tab */}
          <TabsContent value="vuln" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Testing Guide</CardTitle>
                <CardDescription>
                  Learn how to identify and assess security weaknesses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Bug className="h-5 w-5 mr-2 text-primary" />
                    Understanding Web Vulnerabilities
                  </h3>
                  <p>
                    Web vulnerabilities are weaknesses in web applications that can be exploited
                    by attackers to gain unauthorized access, steal data, or disrupt services.
                    Common vulnerabilities include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Missing Security Headers</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">
                          Security headers are HTTP response headers that help protect against
                          various attacks such as XSS, clickjacking, and code injection.
                        </p>
                        <div className="mt-2 rounded-md bg-muted p-2 font-mono text-xs">
                          Content-Security-Policy<br />
                          X-XSS-Protection<br />
                          X-Frame-Options<br />
                          Strict-Transport-Security
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">SSL/TLS Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">
                          Weaknesses in SSL/TLS implementation can lead to data exposure or man-in-the-middle attacks.
                          Issues include outdated protocols, weak ciphers, and certificate problems.
                        </p>
                        <div className="mt-2 rounded-md bg-muted p-2 font-mono text-xs">
                          Using outdated TLS versions (TLS 1.0/1.1)<br />
                          Weak cipher suites<br />
                          Certificate validation issues
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Security Testing Methodology</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                    <div className="space-y-8 relative">
                      <div className="ml-12 relative">
                        <div className="absolute -left-12 mt-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          <span className="text-sm font-medium">1</span>
                        </div>
                        <h4 className="text-base font-medium">Reconnaissance</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Gather information about the target including domain details,
                          server information, and technology stack.
                        </p>
                      </div>
                      <div className="ml-12 relative">
                        <div className="absolute -left-12 mt-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          <span className="text-sm font-medium">2</span>
                        </div>
                        <h4 className="text-base font-medium">Vulnerability Scanning</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use automated tools to identify potential security issues in headers,
                          SSL/TLS configuration, and server information disclosure.
                        </p>
                      </div>
                      <div className="ml-12 relative">
                        <div className="absolute -left-12 mt-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          <span className="text-sm font-medium">3</span>
                        </div>
                        <h4 className="text-base font-medium">Analysis</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Review findings to identify genuine vulnerabilities, prioritize based on
                          severity, and filter out false positives.
                        </p>
                      </div>
                      <div className="ml-12 relative">
                        <div className="absolute -left-12 mt-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          <span className="text-sm font-medium">4</span>
                        </div>
                        <h4 className="text-base font-medium">Reporting</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Generate detailed reports documenting the vulnerabilities found,
                          their potential impact, and recommendations for remediation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 bg-yellow-50 dark:bg-yellow-950/50 mt-6">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                    <div>
                      <h4 className="text-base font-medium text-yellow-800 dark:text-yellow-300">Important Legal Notice</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Always obtain explicit permission before testing for vulnerabilities.
                        Unauthorized security testing may be illegal and could result in criminal charges.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Web Automation Guide</CardTitle>
                <CardDescription>
                  Learn how to use web automation for security testing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Form Analysis</h3>
                    </div>
                    <p>
                      Analyzing forms is critical for security testing as they often serve as the entry point
                      for data into an application. Understanding form structure helps identify potential
                      input validation issues.
                    </p>
                    <div className="rounded-md bg-muted p-3 space-y-3">
                      <p className="text-sm font-medium">What to look for in forms:</p>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        <li>Required vs. optional fields</li>
                        <li>Client-side validation attributes</li>
                        <li>Form submission methods (GET vs. POST)</li>
                        <li>Hidden fields that may contain sensitive data</li>
                        <li>Anti-CSRF tokens and their implementation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="m9.5 7.5-2 2a4.95 4.95 0 1 0 7 7l2-2a4.95 4.95 0 1 0-7-7Z"></path><path d="M14 6.5v10"></path><path d="M10 7.5v10"></path><path d="m16 7 1-5 1.37.68A3 3 0 0 0 19.7 3H21v1.3c0 .46.1.92.32 1.33L22 7l-5 1"></path><path d="m8 17-1 5-1.37-.68A3 3 0 0 0 4.3 21H3v-1.3a3 3 0 0 0-.32-1.33L2 17l5-1"></path></svg>
                      <h3 className="text-lg font-medium">CSS Selectors</h3>
                    </div>
                    <p>
                      CSS selectors allow you to target specific elements on a web page. Understanding
                      how to use selectors effectively can help you identify and interact with key
                      elements during security testing.
                    </p>
                    <div className="rounded-md bg-muted p-3 font-mono text-sm overflow-x-auto">
                      <p># Basic Selectors</p>
                      <p>.class-name <span className="text-muted-foreground"># Select by class</span></p>
                      <p>#id-name <span className="text-muted-foreground"># Select by ID</span></p>
                      <p>input[type="password"] <span className="text-muted-foreground"># Attribute selector</span></p>
                      <p>form button <span className="text-muted-foreground"># Descendant selector</span></p>
                      <p>div {'>'} p <span className="text-muted-foreground"># Direct child selector</span></p>
                    </div>
                  </div>
                </div>

                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Testing Workflow Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <p><span className="text-blue-600 dark:text-blue-400">// Example JavaScript for basic form testing</span></p>
                      <p><span className="text-green-600 dark:text-green-400">// 1. Analyze the login form</span></p>
                      <p>const loginForm = document.querySelector('form#login');</p>
                      <p>const inputs = loginForm.querySelectorAll('input');</p>
                      <p>inputs.forEach(input {'=>'} {'{'}</p>
                      <p>  console.log(`Name: ${'{'}input.name{'}'}, Type: ${'{'}input.type{'}'}, Required: ${'{'}input.required{'}'}`)</p>
                      <p>{'}'})</p>
                      <p>&nbsp;</p>
                      <p><span className="text-green-600 dark:text-green-400">// 2. Test form submission with various inputs</span></p>
                      <p>loginForm.addEventListener('submit', function(e) {'{'}</p>
                      <p>  e.preventDefault(); <span className="text-blue-600 dark:text-blue-400">// Prevent actual submission</span></p>
                      <p>  const formData = new FormData(loginForm);</p>
                      <p>  console.log('Form data:', Object.fromEntries(formData));</p>
                      <p>  <span className="text-blue-600 dark:text-blue-400">// Validate client-side checks</span></p>
                      <p>  <span className="text-blue-600 dark:text-blue-400">// Test for XSS, SQL injection, etc.</span></p>
                      <p>{'}'});</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-4">Security Testing with Web Automation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full bg-primary/10 p-3 mb-2">
                            <Shield className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="font-medium">Input Validation Testing</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Test form inputs with various malicious payloads to identify validation weaknesses.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full bg-primary/10 p-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><rect width="8" height="8" x="2" y="2" rx="2"></rect><path d="M14 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"></path><path d="M20 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"></path><path d="M2 14c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"></path><path d="M2 20c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"></path><rect width="8" height="8" x="14" y="14" rx="2"></rect></svg>
                          </div>
                          <h4 className="font-medium">Authentication Bypass</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Test login forms for vulnerabilities like improper authentication handling.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full bg-primary/10 p-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="M8 15h8"></path></svg>
                          </div>
                          <h4 className="font-medium">CSRF Testing</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Analyze forms for proper CSRF token implementation and protection.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
