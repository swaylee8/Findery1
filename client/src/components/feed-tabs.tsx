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
  // Remove swipe functionality - feed auto-cycles through categories

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm">
      {/* Feed Type Tabs - Compact */}
      <div className="flex items-center justify-center pt-10 pb-1">
        <div className="relative bg-black/40 backdrop-blur-md rounded-full p-0.5 flex">
          {feedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeed === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onFeedChange(tab.id)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-light transition-colors ${
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

      {/* Category Tabs - Auto-Cycling Display Only */}
      <div 
        className="flex items-center justify-center pb-2 px-4 overflow-hidden"
        data-testid="category-tabs-container"
      >
        <div className="flex items-center gap-1">
          {categoryTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`relative px-3 py-1 rounded-full text-xs font-light transition-all ${
                  isActive 
                    ? 'text-white bg-white/20 scale-105' 
                    : 'text-gray-300 hover:text-gray-100'
                }`}
                data-testid={`category-tab-${tab.id}`}
              >
                <div className="flex items-center gap-1">
                  {Icon && <Icon size={10} />}
                  <span>{tab.label}</span>
                </div>
                
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full"
                    layoutId="categoryIndicator"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Navigation Info */}
      <div className="flex justify-center pb-1">
        <div className="text-xs text-gray-400 font-light">
          Auto-cycling through categories
        </div>
      </div>
    </div>
  );
}