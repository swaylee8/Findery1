import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, Home, Car, Anchor } from "lucide-react";

type FeedType = 'for-you' | 'following';
type CategoryType = 'all' | 'homes' | 'cars' | 'boats';

interface FeedTabsProps {
  activeFeed: FeedType;
  activeCategory: CategoryType;
  onFeedChange: (feed: FeedType) => void;
  onCategoryChange: (category: CategoryType) => void;
}

const feedTabs = [
  { id: 'for-you' as const, label: 'For You', icon: Sparkles },
  { id: 'following' as const, label: 'Following', icon: Users }
];

const categoryTabs = [
  { id: 'all' as const, label: 'All', icon: null },
  { id: 'homes' as const, label: 'Homes', icon: Home },
  { id: 'cars' as const, label: 'Cars', icon: Car },
  { id: 'boats' as const, label: 'Boats', icon: Anchor }
];

export default function FeedTabs({ 
  activeFeed, 
  activeCategory, 
  onFeedChange, 
  onCategoryChange 
}: FeedTabsProps) {
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    
    const dragEndX = e.changedTouches[0].clientX;
    const diff = dragStartX - dragEndX;
    const threshold = 100;

    if (Math.abs(diff) > threshold) {
      const categories = categoryTabs.map(tab => tab.id);
      const currentIndex = categories.indexOf(activeCategory);
      
      if (diff > 0 && currentIndex < categories.length - 1) {
        // Swipe left - next category
        onCategoryChange(categories[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous category
        onCategoryChange(categories[currentIndex - 1]);
      }
    }
    
    setDragStartX(null);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm">
      {/* Feed Type Tabs */}
      <div className="flex items-center justify-center pt-12 pb-2">
        <div className="relative bg-black/40 backdrop-blur-md rounded-full p-1 flex">
          {feedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeed === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onFeedChange(tab.id)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
                data-testid={`feed-tab-${tab.id}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="feedTabIndicator"
                    className="absolute inset-0 bg-white/20 rounded-full"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <div className="relative flex items-center gap-2">
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs - Swipeable */}
      <div 
        className="flex items-center justify-center pb-4 px-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        data-testid="category-tabs-container"
      >
        <motion.div 
          className="flex items-center gap-1"
          animate={{
            x: activeCategory === 'all' ? 0 : 
               activeCategory === 'homes' ? -60 :
               activeCategory === 'cars' ? -120 : -180
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {categoryTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                  isActive 
                    ? 'text-white bg-white/30 backdrop-blur-md border border-white/20 scale-110 shadow-white/10' 
                    : 'text-gray-200 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
                data-testid={`category-tab-${tab.id}`}
              >
                <div className="flex items-center gap-1.5">
                  {Icon && <Icon size={12} />}
                  <span>{tab.label}</span>
                </div>
                
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/30"
                    layoutId="categoryIndicator"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Swipe Indicator */}
      <div className="flex justify-center pb-2">
        <div className="flex gap-1">
          {categoryTabs.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-colors ${
                categoryTabs[index].id === activeCategory 
                  ? 'bg-white' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Touch instruction hint - only show first few times */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <span className="text-gray-200 text-sm font-medium animate-pulse">
          Swipe to switch categories
        </span>
      </div>
    </div>
  );
}