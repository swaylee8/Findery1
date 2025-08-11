import { useState, useEffect } from "react";
import { Bell, Grid, Layers, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useListings } from "@/hooks/use-listings";
import { useFollowingFeed } from "@/hooks/use-follows";
// import { useLikes } from "@/hooks/use-listings";
import { useToast } from "@/hooks/use-toast";
import { useOfflineCache } from "@/hooks/use-offline-cache";
import ListingCard from "@/components/listing-card";
import { TinderCard } from "@/components/tinder-card";
import CategoryFilter from "@/components/category-filter";

import AlertModal from "@/components/alert-modal";
import { BottomSheetFilters } from "@/components/bottom-sheet-filters";
import { ListingCardSkeleton, TinderCardSkeleton } from "@/components/skeleton-loader";
import type { ListingWithUser } from "@shared/schema";

interface FilterState {
  priceRange: [number, number];
  bedrooms?: number;
  mileage?: [number, number];
  year?: [number, number];
  zipCode?: string;
  category?: string;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [feedMode, setFeedMode] = useState<"all" | "following">("all");
  const [viewMode, setViewMode] = useState<"grid" | "swipe">("grid");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 5000000],
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    isOnline, 
    cachedListings, 
    cacheListings, 
    hasCachedData, 
    getCacheAge 
  } = useOfflineCache();
  
  const { data: allListings, isLoading: allLoading, refetch: refetchAll } = useListings(
    activeCategory === "all" ? undefined : activeCategory,
    user?.id
  );
  
  const { data: followingListings, isLoading: followingLoading, refetch: refetchFollowing } = useFollowingFeed(
    user?.id || 0
  );

  // const { mutate: toggleLike } = useLikes();
  
  const currentListings = feedMode === "following" ? followingListings : allListings;
  const isLoading = feedMode === "following" ? followingLoading : allLoading;

  // Cache listings when online data is available
  useEffect(() => {
    if (currentListings && isOnline) {
      cacheListings(currentListings);
    }
  }, [currentListings, isOnline, cacheListings]);

  // Apply filters
  const filteredListings = (currentListings || []).filter((listing) => {
    // Price filter
    if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) {
      return false;
    }
    
    // ZIP code filter
    if (filters.zipCode && listing.zipCode !== filters.zipCode) {
      return false;
    }
    
    // Category-specific filters
    if (filters.bedrooms && listing.specs) {
      const specs = typeof listing.specs === 'string' ? JSON.parse(listing.specs) : listing.specs;
      if (!specs.bedrooms || specs.bedrooms < filters.bedrooms) {
        return false;
      }
    }
    
    if (filters.mileage && listing.specs) {
      const specs = typeof listing.specs === 'string' ? JSON.parse(listing.specs) : listing.specs;
      if (!specs.mileage || specs.mileage < filters.mileage[0] || specs.mileage > filters.mileage[1]) {
        return false;
      }
    }
    
    if (filters.year && listing.year) {
      if (listing.year < (filters.year[0] || 0) || listing.year > (filters.year[1] || 9999)) {
        return false;
      }
    }
    
    return true;
  });

  const displayedListings = !isOnline && !currentListings ? cachedListings : filteredListings;

  const handleLike = (listingId: number) => {
    if (!user) return;
    
    // toggleLike({
    //   userId: user.id,
    //   listingId,
    // });
    console.log("Like toggled for listing:", listingId);
  };

  const handleSwipeNext = () => {
    if (currentCardIndex < displayedListings.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Reset to beginning or show completion message
      setCurrentCardIndex(0);
      toast({
        title: "End of listings",
        description: "You've seen all available listings. Starting over!",
      });
    }
  };

  const handleMessage = (listing: ListingWithUser) => {
    // Navigate to messages for this listing
    window.location.href = `/messages?listing=${listing.id}`;
  };

  const handleRefresh = () => {
    if (feedMode === "following") {
      refetchFollowing();
    } else {
      refetchAll();
    }
  };

  const renderSwipeMode = () => {
    if (isLoading) {
      return (
        <div className="relative h-[70vh] mx-4">
          <TinderCardSkeleton />
        </div>
      );
    }

    if (displayedListings.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">No listings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-[70vh] mx-4">
        {displayedListings.slice(currentCardIndex, currentCardIndex + 3).map((listing, index) => (
          <div
            key={listing.id}
            className="absolute inset-0"
            style={{
              zIndex: 3 - index,
              transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
            }}
          >
            <TinderCard
              listing={listing}
              onLike={() => {
                handleLike(listing.id);
                handleSwipeNext();
              }}
              onPass={handleSwipeNext}
              onMessage={() => handleMessage(listing)}
              isLiked={listing.isLiked || false}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderGridMode = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (displayedListings.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">No listings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {displayedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  };

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="safe-area-top bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-instagram-gray">Scroll & Sold</h1>
          <div className="flex items-center space-x-3">
            {/* Online/Offline indicator */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi size={16} className="text-green-600" />
              ) : (
                <WifiOff size={16} className="text-red-600" />
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAlertModal(true)}
              className="text-instagram-light-gray"
            >
              <Bell size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="text-instagram-light-gray"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* Feed Mode Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFeedMode("all")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                feedMode === "all"
                  ? "bg-white text-instagram-gray shadow-sm"
                  : "text-instagram-light-gray"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeedMode("following")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                feedMode === "following"
                  ? "bg-white text-instagram-gray shadow-sm"
                  : "text-instagram-light-gray"
              }`}
            >
              Following
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-instagram-gray shadow-sm"
                  : "text-instagram-light-gray"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("swipe")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "swipe"
                  ? "bg-white text-instagram-gray shadow-sm"
                  : "text-instagram-light-gray"
              }`}
            >
              <Layers size={16} />
            </button>
          </div>
        </div>

        {/* Category Filter and Filters */}
        <div className="flex items-center justify-between">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          
          <BottomSheetFilters
            filters={filters}
            onFiltersChange={setFilters}
            category={activeCategory !== "all" ? activeCategory : undefined}
          />
        </div>

        {/* Offline Cache Indicator */}
        {!isOnline && hasCachedData() && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Showing cached data (offline mode)
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "swipe" ? renderSwipeMode() : renderGridMode()}
      </div>

      <AlertModal
        open={showAlertModal}
        onOpenChange={setShowAlertModal}
      />
    </div>
  );
}