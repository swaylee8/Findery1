import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/enhanced-home";
import TikTokHome from "@/pages/tiktok-home";
import ListingDetail from "@/pages/listing-detail";
import AddListing from "@/pages/add-listing";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Alerts from "@/pages/alerts";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mobile-container bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-instagram-gray mb-2">Scroll & Sold</h1>
          <p className="text-instagram-light-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={TikTokHome} />
          <Route path="/listing/:id" component={ListingDetail} />
          <Route path="/add-listing" component={AddListing} />
          <Route path="/profile" component={Profile} />
          <Route path="/messages/:listingId" component={Messages} />
          <Route path="/alerts" component={Alerts} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
