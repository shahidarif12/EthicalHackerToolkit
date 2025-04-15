import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import Reconnaissance from "@/pages/reconnaissance";
import VulnerabilityScan from "@/pages/vulnerability-scan";
import WebAutomation from "@/pages/web-automation";
import Reports from "@/pages/reports";
import Tutorials from "@/pages/tutorials";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/reconnaissance" component={Reconnaissance} />
      <ProtectedRoute path="/vulnerability-scan" component={VulnerabilityScan} />
      <ProtectedRoute path="/web-automation" component={WebAutomation} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/tutorials" component={Tutorials} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
