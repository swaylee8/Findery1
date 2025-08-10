import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Plus, Menu, Search, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useListings } from "@/hooks/use-listings";
import { useToggleLike } from "@/hooks/use-listings";
import { useHaptics } from "@/hooks/use-haptics";
import { useSound } from "@/hooks/use-sound";
import type { ListingWithUser } from "@shared/schema";
import TikTokListingCard from "../components/tiktok-listing-card";
import CategoryFilter from "../components/category-filter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function TikTokHome() {
  const { user } = useAuth();
  const { data: listings = [], isLoading } = useListings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { triggerHaptic } = useHaptics();
  const { playSound, soundEnabled, toggleSound } = useSound();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const listingRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter listings based on category
  const filteredListings = listings.filter(listing => 
    selectedCategory === "all" || listing.category === selectedCategory
  );

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
        
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredListings.length) {
          setCurrentIndex(newIndex);
          
          // Haptic feedback for scroll snapping
          triggerHaptic('light');
          playSound('snap', 0.1);
          
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
  }, [currentIndex, filteredListings.length, triggerHaptic, playSound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < filteredListings.length - 1) {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredListings.length, triggerHaptic, playSound]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    // Haptic feedback for keyboard navigation
    triggerHaptic('light');
    playSound('snap', 0.1);
    
    setCurrentIndex(index);
    container.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth'
    });
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

  if (filteredListings.length === 0) {
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
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 backdrop-blur-sm"
              data-testid="button-menu"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black/90 backdrop-blur-md border-gray-800">
            <div className="text-white">
              <h2 className="text-xl font-bold mb-6">Scroll & Sold</h2>
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                variant="vertical"
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-white font-bold text-lg">
          Scroll & Sold
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={toggleSound}
            data-testid="button-sound-toggle"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20 backdrop-blur-sm"
            data-testid="button-search"
          >
            <Search size={24} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        data-testid="main-content"
      >
        {filteredListings.map((listing, index) => (
          <div
            key={listing.id}
            ref={(el) => (listingRefs.current[index] = el)}
            className="h-screen snap-start snap-always relative"
            data-testid={`listing-${listing.id}`}
          >
            <TikTokListingCard 
              listing={listing}
              isActive={index === currentIndex}
            />
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg z-50"
        onClick={() => window.location.href = '/add-listing'}
        data-testid="button-add-listing"
      >
        <Plus size={24} className="text-white" />
      </Button>

      {/* Floating Tab Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center space-x-6 border border-gray-700">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:text-purple-400 transition-colors"
            data-testid="button-home"
          >
            Home
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => window.location.href = '/messages'}
            data-testid="button-messages"
          >
            Messages
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => window.location.href = '/profile'}
            data-testid="button-profile"
          >
            Profile
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-2">
          {filteredListings.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-8 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}