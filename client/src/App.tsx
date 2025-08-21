import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { BranchProvider } from "@/context/BranchContext";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import DevLogin from "@/pages/dev-login";
import AdminLogin from "@/pages/admin-login";
import Dashboard from "@/pages/dashboard";
import Events from "@/pages/events";
import Content from "@/pages/content";
import Social from "@/pages/social";
import Calendar from "@/pages/calendar";
import Analytics from "@/pages/analytics";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import BranchManagement from "@/pages/branch-management";
import FeatureHub from "@/pages/feature-hub";
import NotFound from "@/pages/not-found";
import GetStarted from "@/pages/get-started";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/dev-login" component={DevLogin} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/get-started" component={GetStarted} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/events" component={Events} />
          <Route path="/content" component={Content} />
          <Route path="/social" component={Social} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/users" component={Users} />
          <Route path="/settings" component={Settings} />
          <Route path="/features" component={FeatureHub} />
          <Route path="/profile" component={Profile} />
          <Route path="/branch-management" component={BranchManagement} />
          <Route path="/get-started" component={GetStarted} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <BranchProvider>
            <Toaster />
            <Router />
          </BranchProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
