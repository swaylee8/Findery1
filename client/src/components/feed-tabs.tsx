import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Users } from "lucide-react";

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
  { id: 'all' as const, emoji: '✨' },
  { id: 'homes' as const, emoji: '🏠' },
  { id: 'cars' as const, emoji: '🚗' },
  { id: 'boats' as const, emoji: '🚤' }
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
        <div className="flex items-center gap-2">
          {categoryTabs.map((tab, index) => {
            const isActive = activeCategory === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`relative p-2 transition-all duration-300 group hover:scale-110`}
                data-testid={`category-tab-${tab.id}`}
              >
                <span className={`text-xl transition-all duration-300 ${
                  isActive 
                    ? 'scale-125 drop-shadow-lg filter brightness-125' 
                    : 'group-hover:scale-110 group-hover:drop-shadow-md opacity-70 group-hover:opacity-100'
                }`}>
                  {tab.emoji}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}