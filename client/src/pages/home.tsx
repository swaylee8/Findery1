import { useState } from "react";
import { Search, Bell, Users, Grid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useListings } from "@/hooks/use-listings";
import { useFollowingFeed } from "@/hooks/use-follows";
import ListingCard from "@/components/listing-card";
import CategoryFilter from "@/components/category-filter";

import AlertModal from "@/components/alert-modal";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [feedMode, setFeedMode] = useState<"all" | "following">("all");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const { user } = useAuth();
  
  const { data: allListings, isLoading: allLoading } = useListings(
    activeCategory === "all" ? undefined : activeCategory,
    user?.id
  );
  
  const { data: followingListings, isLoading: followingLoading } = useFollowingFeed(
    user?.id || 0
  );
  
  const listings = feedMode === "following" ? followingListings : allListings;
  const isLoading = feedMode === "following" ? followingLoading : allLoading;

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="safe-area-top bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-instagram-gray">Findery</h1>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAlertModal(true)}
              className="text-instagram-light-gray"
            >
              <Bell size={20} />
            </Button>
            <Search className="text-instagram-light-gray" size={20} />
          </div>
        </div>
        
        {/* Feed Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={feedMode === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFeedMode("all")}
              className={`flex items-center space-x-2 px-4 py-2 ${
                feedMode === "all"
                  ? "bg-white shadow-sm text-instagram-gray"
                  : "text-instagram-light-gray hover:text-instagram-gray"
              }`}
            >
              <Grid size={16} />
              <span>For You</span>
            </Button>
            <Button
              variant={feedMode === "following" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFeedMode("following")}
              className={`flex items-center space-x-2 px-4 py-2 ${
                feedMode === "following"
                  ? "bg-white shadow-sm text-instagram-gray"
                  : "text-instagram-light-gray hover:text-instagram-gray"
              }`}
            >
              <Users size={16} />
              <span>Following</span>
            </Button>
          </div>
        </div>
        
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-96 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
            
            {listings?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-instagram-light-gray">
                  {feedMode === "following" 
                    ? "Follow users, categories, or locations to see their listings here"
                    : "No listings found in this category"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}
