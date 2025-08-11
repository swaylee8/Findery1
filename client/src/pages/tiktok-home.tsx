import { useState, useEffect, useRef, useMemo } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Plus, Menu, Search, Home, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useListings } from "@/hooks/use-listings";
import { useToggleLike } from "@/hooks/use-listings";
import { useHaptics } from "@/hooks/use-haptics";
import { useFeedAlgorithm } from "@/hooks/use-feed-algorithm";
import { useSmartLoading } from "@/hooks/use-smart-loading";
import type { ListingWithUser } from "@shared/schema";
import TikTokListingCard from "../components/tiktok-listing-card";
import FeedTabs from "../components/feed-tabs";
import CategoryHeader from "../components/category-header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type FeedType = 'for-you' | 'following';
type CategoryType = 'all' | 'homes' | 'cars' | 'boats';

export default function TikTokHome() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: rawListings = [], isLoading } = useListings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState<FeedType>('for-you');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());
  
  const { triggerHaptic } = useHaptics();
  const { personalizeListings, generateCyclicFeed, trackInteraction, preferences } = useFeedAlgorithm();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const listingRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate cyclic feed with automatic category switching
  const cyclicFeedItems = useMemo(() => {
    if (activeFeed === 'for-you') {
      // Auto-cycling feed: All → Homes → Cars → Boats → repeat
      return generateCyclicFeed(rawListings, 8); // 8 items per category section
    } else {
      // Following feed - chronological with category headers
      const chronological = rawListings.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      return chronological.map(listing => ({ 
        listing, 
        category: listing.category as CategoryType, 
        sectionHeader: false 
      }));
    }
  }, [rawListings, activeFeed, generateCyclicFeed]);

  // Extract just the listings for backwards compatibility with existing code
  const processedListings = useMemo(() => {
    return cyclicFeedItems.map(item => item.listing);
  }, [cyclicFeedItems]);

  // Smart loading
  const {
    isContentLoaded,
    shouldLoadEagerly,
    isImagePreloaded,
    getLoadingPriority,
    preloadedCount,
    loadedCount
  } = useSmartLoading(processedListings, currentIndex);

  // Track view duration when index changes
  useEffect(() => {
    const now = Date.now();
    setViewStartTime(now);
  }, [currentIndex]);

  // Track when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentIndex >= 0 && processedListings.length > 0) {
        const currentListing = processedListings[currentIndex];
        const viewDuration = Date.now() - viewStartTime;
        
        if (viewDuration > 500 && currentListing) {
          trackInteraction({
            listingId: currentListing.id,
            type: 'view',
            duration: viewDuration,
            category: currentListing.category
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentIndex, processedListings, trackInteraction, viewStartTime]);

  // Handle scroll snapping
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isScrolling) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const viewportHeight = window.innerHeight;
        const newIndex = Math.round(scrollTop / viewportHeight);
        
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < processedListings.length) {
          setCurrentIndex(newIndex);
          
          // Haptic feedback for scroll snapping (sound removed)
          triggerHaptic('light');
          
          // Smooth scroll to exact position
          isScrolling = true;
          container.scrollTo({
            top: newIndex * viewportHeight,
            behavior: 'smooth'
          });
          
          setTimeout(() => {
            isScrolling = false;
          }, 500);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, processedListings.length, triggerHaptic]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < processedListings.length - 1) {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, processedListings.length, triggerHaptic]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container || index < 0 || index >= processedListings.length) return;
    
    // Haptic feedback for navigation (sound removed)
    triggerHaptic('light');
    
    setCurrentIndex(index);
    container.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth'
    });
  };

  // Handle feed and category changes
  const handleFeedChange = (feed: FeedType) => {
    setActiveFeed(feed);
    setCurrentIndex(0); // Reset to top when changing feeds
    triggerHaptic('medium');
  };

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    setCurrentIndex(0); // Reset to top when changing categories  
    triggerHaptic('selection');
  };

  // Enhanced interaction tracking
  const handleListingInteraction = (listingId: number, type: 'like' | 'save' | 'share' | 'skip') => {
    const listing = processedListings.find(l => l.id === listingId);
    if (listing) {
      trackInteraction({
        listingId,
        type,
        category: listing.category
      });
    }
  };

  const handlePullToRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading amazing listings...</div>
      </div>
    );
  }

  if (processedListings.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl mb-4">No listings found</h2>
          <p className="text-gray-400">Try a different category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Feed Tabs */}
      <FeedTabs
        activeFeed={activeFeed}
        activeCategory={activeCategory}
        onFeedChange={handleFeedChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Compact Header Navigation */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="fixed top-2 left-2 z-50 text-white hover:bg-white/20 backdrop-blur-sm p-2 rounded-full"
            data-testid="button-menu"
          >
            <Menu size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-black/90 backdrop-blur-md border-gray-800">
          <div className="text-white">
            <h2 className="text-lg font-light mb-6">Scroll & Sold</h2>
            
            {/* Navigation Section */}
            <div className="space-y-1 mb-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setLocation("/");
                  setIsMenuOpen(false);
                  triggerHaptic('light');
                }}
                className="w-full justify-start text-white hover:bg-white/10 px-3 py-3 h-auto"
                data-testid="menu-home"
              >
                <Home className="mr-3" size={20} />
                <span className="text-sm font-light">Home</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  setLocation("/messages");
                  setIsMenuOpen(false);
                  triggerHaptic('light');
                }}
                className="w-full justify-start text-white hover:bg-white/10 px-3 py-3 h-auto"
                data-testid="menu-messages"
              >
                <MessageCircle className="mr-3" size={20} />
                <span className="text-sm font-light">Messages</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  setLocation("/profile");
                  setIsMenuOpen(false);
                  triggerHaptic('light');
                }}
                className="w-full justify-start text-white hover:bg-white/10 px-3 py-3 h-auto"
                data-testid="menu-profile"
              >
                <User className="mr-3" size={20} />
                <span className="text-sm font-light">Profile</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  setLocation("/alerts");
                  setIsMenuOpen(false);
                  triggerHaptic('light');
                }}
                className="w-full justify-start text-white hover:bg-white/10 px-3 py-3 h-auto"
                data-testid="menu-alerts"
              >
                <Bell className="mr-3" size={20} />
                <span className="text-sm font-light">Alerts</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 mb-4"></div>
            
            {/* Debug Information */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-light text-gray-400 mb-2">Feed Algorithm</h3>
                <div className="text-xs text-gray-300 space-y-1 font-light">
                  <div>Homes: {Math.round(preferences.categoryWeights.homes * 100)}%</div>
                  <div>Cars: {Math.round(preferences.categoryWeights.cars * 100)}%</div>
                  <div>Boats: {Math.round(preferences.categoryWeights.boats * 100)}%</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-light text-gray-400 mb-2">Smart Loading</h3>
                <div className="text-xs text-gray-300 font-light">
                  <div>Preloaded: {preloadedCount} images</div>
                  <div>Loaded: {loadedCount} listings</div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sound toggle removed - no audio in app */}

      {/* Main Content with Cyclic Feed and Category Headers */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        data-testid="main-content"
      >
        {cyclicFeedItems.map((item, index) => (
          <div key={`feed-${item.listing.id}-${index}`} className="relative">
            {/* Category Header */}
            {item.sectionHeader && (
              <CategoryHeader category={item.category} />
            )}
            
            {/* Listing Container */}
            <div
              key={`container-${item.listing.id}-${index}`}
              ref={(el) => (listingRefs.current[index] = el)}
              className="h-screen snap-start snap-always relative"
              data-testid={`listing-${item.listing.id}`}
            >
              <TikTokListingCard 
                listing={item.listing}
                isActive={index === currentIndex}
                onInteraction={(type) => handleListingInteraction(item.listing.id, type)}
                loadingPriority={getLoadingPriority(index)}
                shouldLoadEagerly={shouldLoadEagerly(index)}
                isImagePreloaded={item.listing.images?.[0] ? isImagePreloaded(item.listing.images[0]) : false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Removed floating action button - moved to Profile section */}
      {/* Removed floating tab bar - navigation moved to hamburger menu */}
    </div>
  );
}