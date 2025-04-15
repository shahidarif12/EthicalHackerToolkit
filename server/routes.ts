import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { exec } from "child_process";
import util from "util";
import { z } from "zod";
import { insertScanSchema, insertReportSchema } from "@shared/schema";
import axios from "axios";
import { JSDOM } from "jsdom";
import dns from "dns";
import whois from "whois-json";

// Promisify exec for running shell commands
const execAsync = util.promisify(exec);

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
            // Using a timeout to speed up the scan
            const { stdout } = await execAsync(
              `nc -z -w 1 ${target} ${port} && echo "open" || echo "closed"`,
              { timeout: 5000 }
            );
            
            if (stdout.trim() === "open") {
              results.openPorts.push(port);
            }
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
  const httpServer = createServer(app);

  return httpServer;
}
