import { 
  users, type User, type InsertUser,
  scans, type Scan, type InsertScan,
  activityLogs, type ActivityLog, type InsertActivityLog,
  reports, type Report, type InsertReport
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: number): Promise<Scan | undefined>;
  getScansByUserId(userId: number): Promise<Scan[]>;
  updateScanStatus(id: number, status: string, findings?: any): Promise<Scan | undefined>;

  // ActivityLog operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByUserId(userId: number): Promise<ActivityLog[]>;

  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReportById(id: number): Promise<Report | undefined>;
  getReportsByScanId(scanId: number): Promise<Report[]>;
  getReportsByUserId(userId: number): Promise<Report[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scans: Map<number, Scan>;
  private activityLogs: Map<number, ActivityLog>;
  private reports: Map<number, Report>;
  
  currentUserId: number;
  currentScanId: number;
  currentActivityLogId: number;
  currentReportId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.activityLogs = new Map();
    this.reports = new Map();
    
    this.currentUserId = 1;
    this.currentScanId = 1;
    this.currentActivityLogId = 1;
    this.currentReportId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add admin user by default
    this.createUser({
      username: "admin",
      password: "password_hash_will_be_applied", // This will be hashed in auth.ts
      role: "admin"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Scan methods
  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = this.currentScanId++;
    const now = new Date();
    const scan: Scan = { 
      ...insertScan, 
      id, 
      createdAt: now 
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async getScansByUserId(userId: number): Promise<Scan[]> {
    return Array.from(this.scans.values()).filter(
      (scan) => scan.userId === userId
    );
  }

  async updateScanStatus(id: number, status: string, findings?: any): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) return undefined;
    
    const updatedScan: Scan = { 
      ...scan, 
      status, 
      findings: findings ?? scan.findings 
    };
    
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  // ActivityLog methods
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const now = new Date();
    const log: ActivityLog = { 
      ...insertLog, 
      id, 
      timestamp: now 
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getActivityLogsByUserId(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Report methods
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const now = new Date();
    const report: Report = { 
      ...insertReport, 
      id, 
      createdAt: now 
    };
    this.reports.set(id, report);
    return report;
  }

  async getReportById(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByScanId(scanId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter((report) => report.scanId === scanId);
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter((report) => report.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
