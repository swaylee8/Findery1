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
import SellerProfile from "@/pages/seller-profile";
import Messages from "@/pages/messages";
import Alerts from "@/pages/alerts";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Branded Loading Animation */}
          <div className="relative mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-80 animate-pulse"></div>
              <div className="absolute inset-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>
            
            {/* Glassmorphism Loading Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-light text-white mb-2 tracking-wide">Findery</h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto"></div>
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
          <Route path="/seller/:sellerId" component={SellerProfile} />
          <Route path="/messages" component={Messages} />
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
