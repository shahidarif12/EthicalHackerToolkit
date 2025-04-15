// Security tool types

export interface ScanResult {
  scanId: number;
  results: any;
}

// DNS Lookup types
export interface DnsLookupResult {
  addressInfo: {
    address: string;
    family: number;
  } | null;
  mxRecords: Array<{
    priority: number;
    exchange: string;
  }> | null;
  nsRecords: string[] | null;
  txtRecords: string[] | null;
  error: string | null;
}

// WHOIS types
export interface WhoisResult {
  whoisResults: {
    [key: string]: string;
  } | null;
  error: string | null;
}

// Port Scan types
export interface PortScanResult {
  openPorts: number[];
  error: string | null;
}

// Tech Scan types
export interface TechScanResult {
  technologies: string[];
  headers: {
    [key: string]: string;
  };
  error: string | null;
}

// Vulnerability Scan types
export interface VulnerabilityResult {
  vulnerabilities: Array<{
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
  }>;
  securityHeaders: {
    [key: string]: string | null;
  };
  sslInfo: {
    secure: boolean;
    protocol: string;
  } | null;
  error: string | null;
}

// Web Automation types
export interface WebAutomationResult {
  elements: Array<{
    selector: string;
    count: number;
    found: boolean;
    error?: string;
  }>;
  forms: Array<{
    id: string;
    action: string;
    method: string;
    inputs: Array<{
      name: string;
      type: string;
      id: string;
      required: boolean;
    }>;
  }>;
  error: string | null;
}

// Stats types for dashboard
export interface Stats {
  totalScans: number;
  vulnerabilities: number;
  reports: number;
  lastScan?: string;
}

// Recent scan types for dashboard
export interface RecentScan {
  id: number;
  target: string;
  scanType: string;
  status: string;
  date: string;
  findings: {
    count?: number;
    low?: number;
    medium?: number;
    high?: number;
  };
}

// Terminal output types
export interface TerminalOutput {
  lines: Array<{
    text: string;
    type: 'info' | 'success' | 'error' | 'warning' | 'command' | 'output';
  }>;
}
