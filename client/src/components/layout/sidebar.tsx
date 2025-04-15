import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  Bug, 
  Code, 
  FileText, 
  GraduationCap, 
  History, 
  Settings, 
  HelpCircle
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
        )}
      >
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
}

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

function NavGroup({ title, children }: NavGroupProps) {
  return (
    <div className="mb-4">
      <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/">
          <a className="flex items-center gap-2 font-semibold text-primary">
            <ShieldAlert className="h-5 w-5" />
            <span>SecureTest</span>
          </a>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <NavGroup title="Main">
            <NavItem 
              href="/" 
              icon={<LayoutDashboard className="h-4 w-4" />} 
              active={location === "/"}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/reconnaissance" 
              icon={<Search className="h-4 w-4" />} 
              active={location === "/reconnaissance"}
            >
              Reconnaissance
            </NavItem>
            <NavItem 
              href="/vulnerability-scan" 
              icon={<Bug className="h-4 w-4" />} 
              active={location === "/vulnerability-scan"}
            >
              Vulnerability Scan
            </NavItem>
            <NavItem 
              href="/web-automation" 
              icon={<Code className="h-4 w-4" />} 
              active={location === "/web-automation"}
            >
              Web Automation
            </NavItem>
            <NavItem 
              href="/reports" 
              icon={<FileText className="h-4 w-4" />} 
              active={location === "/reports"}
            >
              Reports
            </NavItem>
            <NavItem 
              href="/tutorials" 
              icon={<GraduationCap className="h-4 w-4" />} 
              active={location === "/tutorials"}
            >
              Tutorials
            </NavItem>
          </NavGroup>

          <NavGroup title="User">
            <NavItem 
              href="/activity" 
              icon={<History className="h-4 w-4" />} 
              active={location === "/activity"}
            >
              Activity Log
            </NavItem>
            <NavItem 
              href="/settings" 
              icon={<Settings className="h-4 w-4" />} 
              active={location === "/settings"}
            >
              Settings
            </NavItem>
            <NavItem 
              href="/help" 
              icon={<HelpCircle className="h-4 w-4" />} 
              active={location === "/help"}
            >
              Help & Support
            </NavItem>
          </NavGroup>
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={user.username} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
