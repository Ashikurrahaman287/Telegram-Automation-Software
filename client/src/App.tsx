import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

// Import all pages
import Dashboard from "@/pages/Dashboard";
import MemberScraping from "@/pages/MemberScraping";
import AddMembers from "@/pages/AddMembers";
import AutoMessage from "@/pages/AutoMessage";
import AvatarUpload from "@/pages/AvatarUpload";
import UserSearch from "@/pages/UserSearch";
import GroupPosting from "@/pages/GroupPosting";
import AccountStatus from "@/pages/AccountStatus";
import ManualControl from "@/pages/ManualControl";
import Settings from "@/pages/Settings";
import ProxySettings from "@/pages/ProxySettings";
import BlacklistWhitelist from "@/pages/BlacklistWhitelist";

function Router() {
  return (
    <Switch>
      {/* Main pages */}
      <Route path="/" component={Dashboard} />
      <Route path="/member-scraping" component={MemberScraping} />
      <Route path="/add-members" component={AddMembers} />
      <Route path="/auto-message" component={AutoMessage} />
      <Route path="/avatar-upload" component={AvatarUpload} />
      <Route path="/user-search" component={UserSearch} />
      <Route path="/group-posting" component={GroupPosting} />
      
      {/* Account management */}
      <Route path="/account-status" component={AccountStatus} />
      <Route path="/manual-control" component={ManualControl} />
      
      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/proxy-settings" component={ProxySettings} />
      <Route path="/blacklist-whitelist" component={BlacklistWhitelist} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
