import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  Mail, 
  FileText, 
  Shield,
  Zap,
  Bug,
  Code,
  LifeBuoy
} from "lucide-react";

export default function HelpPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to a search API in a real application
    toast({
      title: "Search Results",
      description: `Showing results for: "${searchQuery}"`
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to an API to send the contact form
    toast({
      title: "Message Sent",
      description: "Thank you! Your message has been sent. We'll get back to you soon."
    });
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help using the SecureTest platform and learn about security testing.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form className="flex gap-2" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search documentation and FAQs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </TabsTrigger>
            <TabsTrigger value="resources">
              <BookOpen className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about the SecureTest platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is SecureTest platform?</AccordionTrigger>
                    <AccordionContent>
                      SecureTest is a comprehensive security testing and educational platform that provides tools for reconnaissance, vulnerability scanning, and web automation. It helps security professionals, developers, and IT teams identify security issues in their web applications and infrastructure.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it legal to use these security tools?</AccordionTrigger>
                    <AccordionContent>
                      Using security testing tools is legal when you have explicit permission to test the target systems. Always ensure you have proper authorization before conducting any security tests. Unauthorized testing can violate computer crime laws in many jurisdictions.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I interpret scan results?</AccordionTrigger>
                    <AccordionContent>
                      Scan results are categorized by severity (high, medium, low) and include detailed explanations of each finding. The platform provides recommendations for remediation. For more guidance, refer to the detailed documentation or contact our support team for assistance with interpreting complex results.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Can I schedule automated scans?</AccordionTrigger>
                    <AccordionContent>
                      Yes, SecureTest allows you to schedule recurring scans. Navigate to the Dashboard, select "New Scan," and choose the "Schedule" option. You can set up daily, weekly, or monthly scans and receive notifications when they complete.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I export or share reports?</AccordionTrigger>
                    <AccordionContent>
                      Reports can be exported in multiple formats including PDF, JSON, and CSV. Navigate to the Reports section, select the report you want to share, and click the "Export" button. You can also generate a shareable link for team members who have access to the platform.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>What information gathering tools are available?</AccordionTrigger>
                    <AccordionContent>
                      SecureTest offers several information gathering tools including DNS Lookup, WHOIS Lookup, Port Scanner, and Technology Scanner. These tools help you collect intelligence about the target system before conducting more in-depth security testing. All tools can be accessed from the Reconnaissance section.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger>Is my data secure on the platform?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we take data security seriously. All scan data and reports are encrypted both in transit and at rest. We implement strict access controls and do not share your data with third parties. For more details, please review our privacy policy and security documentation.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resources & Documentation</CardTitle>
                <CardDescription>
                  Explore guides, tutorials, and documentation to make the most of SecureTest.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Getting Started Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Learn the fundamentals of using SecureTest, including setting up your account and running your first scan.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Read Guide
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        Quick Start Tutorials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Step-by-step tutorials for each security testing tool in the platform.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Tutorials
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        API Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Comprehensive documentation for integrating with the SecureTest API.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View API Docs
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Bug className="h-4 w-4 mr-2 text-primary" />
                        Vulnerability Database
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Browse our database of common vulnerabilities with detailed explanations and remediation steps.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Browse Database
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Code className="h-4 w-4 mr-2 text-primary" />
                        Web Automation Playbooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Pre-configured automation scripts for common security testing scenarios.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Playbooks
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <LifeBuoy className="h-4 w-4 mr-2 text-primary" />
                        Troubleshooting Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Solutions to common issues and troubleshooting steps for the platform.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Guide
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Learning Resources
                  </h3>
                  <p className="mb-4">
                    Enhance your security testing knowledge with these educational resources.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <a href="#" className="text-primary hover:underline">OWASP Top 10 Web Application Vulnerabilities</a>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Introduction to Penetration Testing Methodology</a>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Secure Coding Practices for Developers</a>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Network Security Fundamentals</a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team for assistance with any issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-primary/5">
                    <CardContent className="p-4 text-center">
                      <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
                      <h3 className="font-medium mb-1">Email Support</h3>
                      <p className="text-sm text-muted-foreground">
                        support@securetest.com
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Response within 24 hours
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary/5">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
                      <h3 className="font-medium mb-1">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Available Monday-Friday
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        9:00 AM - 5:00 PM EST
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary/5">
                    <CardContent className="p-4 text-center">
                      <HelpCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                      <h3 className="font-medium mb-1">Support Ticket</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a support ticket
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        For complex issues
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Send us a message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Your Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          required
                          value={contactForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={contactForm.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Help with vulnerability scanning"
                        required
                        value={contactForm.subject}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Describe your issue in detail..."
                        rows={5}
                        required
                        value={contactForm.message}
                        onChange={handleInputChange}
                      />
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      Send Message
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}