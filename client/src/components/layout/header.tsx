import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Menu, Sun, Moon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";
import { ScanModal } from "../ui/scan-modal";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/">
            <div className="flex items-center gap-2 font-semibold text-primary cursor-pointer">
              <ShieldAlert className="h-5 w-5" />
              <span>SecureTest</span>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center">
          <nav className="flex items-center text-sm text-muted-foreground space-x-1">
            {location !== "/" && (
              <>
                <Link href="/">
                  <div className="hover:text-foreground cursor-pointer">Dashboard</div>
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {location === "/reconnaissance" && "Reconnaissance"}
                  {location === "/vulnerability-scan" && "Vulnerability Scan"}
                  {location === "/web-automation" && "Web Automation"}
                  {location === "/reports" && "Reports"}
                  {location === "/tutorials" && "Tutorials"}
                  {location === "/activity" && "Activity Log"}
                  {location === "/settings" && "Settings"}
                  {location === "/help" && "Help & Support"}
                </span>
              </>
            )}
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowScanModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline-block">New Scan</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <ScanModal open={showScanModal} onOpenChange={setShowScanModal} />
    </>
  );
}
