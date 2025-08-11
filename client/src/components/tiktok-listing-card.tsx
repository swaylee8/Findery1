import { useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Flag, User, ExternalLink, Circle, Users, Camera, ChevronLeft, ChevronRight, TrendingUp, Layers, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useHaptics } from "@/hooks/use-haptics";

import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Listing } from "@shared/schema";

interface TikTokListingCardProps {
  listing: Listing;
  isActive: boolean;
  onInteraction?: (type: 'like' | 'save' | 'share' | 'skip') => void;
  loadingPriority?: 'immediate' | 'high' | 'medium' | 'low';
  shouldLoadEagerly?: boolean;
  isImagePreloaded?: boolean;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  return `$${price.toLocaleString()}`;
};

export default function TikTokListingCard({ 
  listing, 
  isActive, 
  onInteraction,
  loadingPriority = 'medium',
  shouldLoadEagerly = false,
  isImagePreloaded = false 
}: TikTokListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showCommentsOverlay, setShowCommentsOverlay] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [show360Viewer, setShow360Viewer] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showSimilarListings, setShowSimilarListings] = useState(false);
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [isLongPress, setIsLongPress] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { triggerHaptic } = useHaptics();
  const { toast } = useToast();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const likeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/listings/${listing.id}/like`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/listings/${listing.id}/save`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    },
  });

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected - toggle like state
      const newLikedState = !liked;
      setLiked(newLikedState);
      setShowHeartAnimation(true);
      triggerHaptic('medium');
      
      // Sound removed - keeping haptic feedback only
      
      onInteraction?.('like');
      likeMutation.mutate();
      
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    
    setLastTap(now);
  }, [lastTap, liked, triggerHaptic, onInteraction, likeMutation]);

  const handleLongPressStart = useCallback(() => {
    setIsLongPress(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      setShowContextMenu(true);
      triggerHaptic('heavy');
    }, 500);
  }, [triggerHaptic]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  // Remove swipe functionality - all interactions via buttons only

  const handleLike = useCallback(() => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    triggerHaptic('light');
    
    // Sound removed - keeping haptic feedback only
    
    onInteraction?.('like');
    likeMutation.mutate();
  }, [liked, triggerHaptic, onInteraction, likeMutation]);

  const handleSave = useCallback(() => {
    setSaved(!saved);
    triggerHaptic('light');
    onInteraction?.('save');
    saveMutation.mutate();
  }, [saved, triggerHaptic, onInteraction, saveMutation]);

  const handleShare = useCallback(() => {
    triggerHaptic('light');
    onInteraction?.('share');
    
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.category.slice(0, -1)}: ${listing.title} - $${listing.price.toLocaleString()}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast({
        title: "Link copied!",
        description: "Share this listing with others",
      });
    }
  }, [listing, triggerHaptic, onInteraction, toast]);

  const handleCommentsOpen = useCallback(() => {
    triggerHaptic('light');
    setShowCommentsOverlay(true);
  }, [triggerHaptic]);

  const handleProfilePreview = useCallback(() => {
    triggerHaptic('light');
    // Navigate to seller profile page instead of showing preview
    setLocation(`/seller/${listing.userId}`);
  }, [triggerHaptic, listing.userId, setLocation]);

  // Mock seller data - in real app this would come from API
  const mockSeller = {
    name: listing.userId === 1 ? "Sarah Johnson" : 
          listing.userId === 2 ? "Mike Rodriguez" : 
          listing.userId === 3 ? "Emma Chen" : "Alex Thompson",
    avatar: listing.userId === 1 ? "https://images.unsplash.com/photo-1494790108755-2616b612b57c?w=150&h=150&fit=crop&crop=face" : 
            listing.userId === 2 ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" : 
            listing.userId === 3 ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" : 
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: listing.userId === 1 ? "Real estate professional with 8+ years experience. Specializing in luxury homes." : 
         listing.userId === 2 ? "Car enthusiast and dealer. Authentic vehicles, fair prices." : 
         listing.userId === 3 ? "Yacht broker and marine specialist. Your dream boat awaits." : 
         "Trusted seller with excellent reviews.",
    listingsCount: listing.userId === 1 ? 24 : listing.userId === 2 ? 18 : listing.userId === 3 ? 12 : 8,
    isOnline: Math.random() > 0.3, // 70% chance online for demo
    lastSeen: Math.random() > 0.5 ? "2 min ago" : "1 hour ago"
  };

  // Mock comments data
  const mockComments = [
    { id: 1, user: "Jennifer", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face", text: "Is this still available?", time: "2m" },
    { id: 2, user: "David", avatar: "https://images.unsplash.com/photo-1539571696490-3de1b01e8b87?w=40&h=40&fit=crop&crop=face", text: "Beautiful property! Any recent renovations?", time: "5m" },
    { id: 3, user: "Lisa", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face", text: "Would love to schedule a viewing", time: "12m" },
  ];

  // Mock price history data
  const mockPriceHistory = [
    { date: "Dec 1", price: listing.price + 15000 },
    { date: "Dec 15", price: listing.price + 10000 },
    { date: "Jan 1", price: listing.price + 5000 },
    { date: "Jan 15", price: listing.price },
  ];

  // Mock similar listings
  const mockSimilarListings = [
    { id: 99, title: "Similar Property", price: listing.price - 25000, image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&h=150&fit=crop" },
    { id: 98, title: "Related Listing", price: listing.price + 15000, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop" },
    { id: 97, title: "Nearby Option", price: listing.price - 10000, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=150&fit=crop" },
  ];

  // Mock custom boards
  const mockBoards = [
    { id: 1, name: "Dream Homes", icon: "🏡", count: 12 },
    { id: 2, name: "Weekend Cars", icon: "🚗", count: 8 },
    { id: 3, name: "Vacation Boats", icon: "⛵", count: 5 },
    { id: 4, name: "Investment Properties", icon: "💰", count: 15 },
  ];

  const handle360Viewer = useCallback(() => {
    triggerHaptic('light');
    setShow360Viewer(true);
  }, [triggerHaptic]);

  const handlePriceHistory = useCallback(() => {
    triggerHaptic('light');
    setShowPriceHistory(true);
  }, [triggerHaptic]);

  const handleSimilarListings = useCallback(() => {
    triggerHaptic('light');
    setShowSimilarListings(true);
  }, [triggerHaptic]);

  const handleBoardSelector = useCallback(() => {
    triggerHaptic('light');
    setShowBoardSelector(true);
  }, [triggerHaptic]);

  const toggleDescription = useCallback(() => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
    triggerHaptic('light');
  }, [isDescriptionExpanded, triggerHaptic]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  }, [listing.images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  }, [listing.images.length]);

  const specs = typeof listing.specs === 'string' ? JSON.parse(listing.specs) : listing.specs;

  // Enhanced price formatting and psychology
  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return { symbol: '$', amount: formatted };
  };

  const formatPriceShort = (price: number) => {
    if (price >= 1000000) {
      return { symbol: '$', amount: `${(price / 1000000).toFixed(1)}M` };
    }
    if (price >= 1000) {
      return { symbol: '$', amount: `${(price / 1000).toFixed(0)}K` };
    }
    return { symbol: '$', amount: price.toLocaleString() };
  };

  // Price analysis for psychological pricing
  const originalPrice = listing.price + (Math.random() > 0.7 ? Math.floor(Math.random() * 50000) + 10000 : 0);
  const hasDiscount = originalPrice > listing.price;
  const monthlyPayment = Math.floor(listing.price * 0.004); // Rough 4% monthly rate
  const isPriceDrop = hasDiscount;
  const isGreatDeal = Math.random() > 0.6; // 40% chance of being marked as great deal
  const isBelowMarket = Math.random() > 0.5;
  const isNegotiable = Math.random() > 0.4; // 60% chance of being negotiable
  const hasFinancing = listing.price > 50000; // Show financing for expensive items

  // Description truncation for mobile - 1 line only (approximately 40-50 characters)
  const MOBILE_DESCRIPTION_LIMIT = 45;
  const shouldTruncateDescription = listing.description.length > MOBILE_DESCRIPTION_LIMIT;
  const previewDescription = shouldTruncateDescription 
    ? listing.description.slice(0, MOBILE_DESCRIPTION_LIMIT).trim() + '...'
    : listing.description;

  return (
    <>
      <div
        ref={cardRef}
        data-testid={`listing-card-${listing.id}`}
        className="relative h-screen w-full overflow-hidden snap-start snap-always"
        onPointerDown={handleLongPressStart}
        onPointerUp={handleLongPressEnd}
        onPointerLeave={handleLongPressEnd}
        onClick={handleDoubleTap}
      >
        {/* Background Image/Video - Optimized for Mobile Density */}
        <div className="absolute inset-0">
          <img
            src={listing.images[currentImageIndex]}
            alt={listing.title}
            className="h-full w-full object-cover scale-105"
            loading={shouldLoadEagerly ? "eager" : "lazy"}
            style={{
              filter: isImagePreloaded ? 'none' : 'blur(3px)',
              transition: 'filter 0.2s ease'
            }}
            data-testid={`listing-image-${listing.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />
          
          {/* Compact Image Navigation Controls */}
          {listing.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm rounded-full p-1.5 text-white hover:bg-black/60 transition-colors z-20 border border-white/10"
                data-testid="prev-image"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm rounded-full p-1.5 text-white hover:bg-black/60 transition-colors z-20 border border-white/10"
                data-testid="next-image"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              
              {/* Minimal Image Dots Indicator */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                    data-testid={`image-dot-${index}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Price Drop & Great Deal Badges - Left Side with Mobile Optimization */}
        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20 max-w-[90px] sm:max-w-none">
          {isPriceDrop && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/30 backdrop-blur-xl text-red-100 text-xs font-medium px-2 py-0.5 rounded-md border border-red-400/30 shadow-sm"
              style={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(12px) saturate(150%)'
              }}
              data-testid="price-drop-badge"
            >
              Price Drop
            </motion.div>
          )}
          {isGreatDeal && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-500/30 backdrop-blur-xl text-green-100 text-xs font-medium px-2 py-0.5 rounded-md border border-green-400/30 shadow-sm"
              style={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(12px) saturate(150%)'
              }}
              data-testid="great-deal-badge"
            >
              Great Deal
            </motion.div>
          )}
        </div>

        {/* Enhanced Action Buttons - Glassmorphism Style */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          {/* 360° View Button */}
          <motion.button
            onClick={handle360Viewer}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="min-w-[44px] min-h-[44px] bg-black/25 backdrop-blur-sm rounded-xl p-2.5 text-white transition-all duration-200 border border-white/15 shadow-lg hover:bg-black/35 hover:shadow-xl active:bg-black/45"
            style={{
              backdropFilter: 'blur(8px) saturate(150%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
            aria-label="View in 360°"
            data-testid="360-view-button"
          >
            <Camera className="w-5 h-5 drop-shadow-sm" />
          </motion.button>
          
          {/* AR Preview Button */}
          <motion.button
            onClick={() => {
              triggerHaptic('medium');
              toast({
                title: "AR Preview",
                description: "View this item in your space using your camera",
                duration: 3000,
              });
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="min-w-[44px] min-h-[44px] bg-black/25 backdrop-blur-sm rounded-xl p-2.5 text-white transition-all duration-200 border border-white/15 shadow-lg hover:bg-black/35 hover:shadow-xl active:bg-black/45"
            style={{
              backdropFilter: 'blur(8px) saturate(150%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
            aria-label="AR Preview"
            data-testid="ar-preview-button"
          >
            <Maximize2 className="w-5 h-5 drop-shadow-sm" />
          </motion.button>
          
          {/* Price History Button */}
          <motion.button
            onClick={handlePriceHistory}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="min-w-[44px] min-h-[44px] bg-black/25 backdrop-blur-sm rounded-xl p-2.5 text-white transition-all duration-200 border border-white/15 shadow-lg hover:bg-black/35 hover:shadow-xl active:bg-black/45"
            style={{
              backdropFilter: 'blur(8px) saturate(150%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
            aria-label="Price History"
            data-testid="price-history-button"
          >
            <TrendingUp className="w-5 h-5 drop-shadow-sm" />
          </motion.button>
        </div>

        {/* Double-tap Heart Animation */}
        <AnimatePresence>
          {showHeartAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1.2], 
                opacity: [0, 1, 0],
                rotate: liked ? 0 : [0, 15, -15, 0] // Shake animation when unliking
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1,
                rotate: { duration: 0.5 }
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              data-testid="heart-animation"
            >
              {liked ? (
                // Liked state - full red heart
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
              ) : (
                // Unliked state - broken heart effect
                <div className="relative">
                  <Heart className="w-24 h-24 text-gray-400 fill-gray-400 drop-shadow-2xl opacity-60" />
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: [1, 1.1, 0.8], opacity: [1, 0.8, 0.3] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-1 h-12 bg-gray-600 rotate-45 absolute"></div>
                    <div className="w-1 h-12 bg-gray-600 -rotate-45 absolute"></div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe indicators removed - button-only interactions */}

        {/* Right Action Bar - Compact */}
        <div className="absolute right-3 bottom-24 flex flex-col gap-3 z-20">
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-0.5 group"
            data-testid={`button-like-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5 group-active:scale-95 transition-transform shadow-sm border border-white/10">
              <Heart 
                className={`w-6 h-6 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} 
              />
            </div>
            <span className="text-white text-xs font-light">12.3K</span>
          </button>

          <button
            onClick={handleCommentsOpen}
            className="flex flex-col items-center gap-0.5 group"
            data-testid={`button-comments-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5 group-active:scale-95 transition-transform shadow-sm border border-white/10">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-light">234</span>
          </button>

          <button
            onClick={handleBoardSelector}
            className="flex flex-col items-center gap-0.5 group"
            data-testid={`button-save-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5 group-active:scale-95 transition-transform shadow-sm border border-white/10">
              <Layers 
                className={`w-6 h-6 ${saved ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`} 
              />
            </div>
            <span className="text-white text-xs font-light">Save</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-0.5 group"
            data-testid={`button-share-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5 group-active:scale-95 transition-transform shadow-sm border border-white/10">
              <Share className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {/* Bottom Info Panel - Compact */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="space-y-2">
            {/* Seller Profile Section - Click to view profile and message */}
            <div className="mb-2">
              <button
                onClick={handleProfilePreview}
                className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
                data-testid={`seller-profile-${listing.id}`}
              >
                <div className="relative">
                  <img
                    src={mockSeller.avatar}
                    alt="Seller"
                    className="w-10 h-10 rounded-full border border-white/20 hover:border-white/40 transition-colors"
                  />
                  {/* Online Status Indicator - Smaller */}
                  {mockSeller.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-black">
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm flex items-center gap-2">
                    {mockSeller.name}
                    {mockSeller.isOnline && (
                      <span className="text-green-400 text-xs font-light">• Online</span>
                    )}
                  </p>
                  <p className="text-gray-300 text-xs font-light">
                    {mockSeller.listingsCount} listings • {mockSeller.isOnline ? "Active now" : `Last seen ${mockSeller.lastSeen}`}
                  </p>
                </div>
                <div className="text-gray-400">
                  <ChevronRight size={16} />
                </div>
              </button>
            </div>

            {/* Sleek Price Display - Left Aligned - Compact */}
            <div className="flex items-start justify-between mb-3">
              {/* Premium Price Display - Left Side */}
              <div className="text-left">
                {isNegotiable && (
                  <p className="text-white/60 text-xs font-light mb-0.5">From</p>
                )}
                
                <div className="flex items-baseline gap-2">
                  <div className="flex items-baseline">
                    <span className="text-base font-light text-white/80 mr-0.5">
                      $
                    </span>
                    <span className="text-2xl font-light tracking-wide text-white">
                      {new Intl.NumberFormat('en-US').format(listing.price)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-baseline text-white/40 text-sm line-through font-light">
                      <span className="text-xs mr-0.5">$</span>
                      <span>{new Intl.NumberFormat('en-US').format(originalPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Subtle context */}
                <div className="flex items-center gap-2 mt-0.5">
                  {hasFinancing && (
                    <span className="text-white/50 text-xs font-light">
                      ${Math.floor(listing.price * 0.004).toLocaleString()}/mo
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-green-300/80 text-xs font-light">
                      Save ${(originalPrice - listing.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Removed badges from right side - moved to left */}
            </div>

            {/* Title - Compact */}
            <h2 className="text-xl font-medium text-white mb-2 leading-tight">
              {listing.title}
            </h2>
            
            {/* Responsive Description */}
            <div className="max-w-[80%]">
              {/* Mobile: Truncated with Show More */}
              <div className="block md:hidden">
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isDescriptionExpanded ? "auto" : "fit-content"
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className={`text-gray-200 text-sm leading-relaxed ${
                    isDescriptionExpanded ? '' : 'truncate whitespace-nowrap overflow-hidden'
                  }`}>
                    {isDescriptionExpanded ? listing.description : previewDescription}
                  </p>
                </motion.div>
                {shouldTruncateDescription && (
                  <button
                    onClick={toggleDescription}
                    className="text-blue-400 text-sm font-medium mt-1 hover:text-blue-300 transition-colors"
                    data-testid="toggle-description"
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              {/* Desktop/Tablet: Full Description */}
              <div className="hidden md:block">
                <p className="text-gray-200 text-sm leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-300 text-sm font-light">
              <span>📍 {listing.location}</span>
              {listing.category === 'homes' && specs && (
                <>
                  <span>🛏️ {specs.bedrooms} bed</span>
                  <span>🛁 {specs.bathrooms} bath</span>
                </>
              )}
              {listing.category === 'cars' && specs && (
                <>
                  <span>📅 {specs.year}</span>
                  <span>📏 {specs.mileage?.toLocaleString()} mi</span>
                </>
              )}
              {listing.category === 'boats' && specs && (
                <>
                  <span>⛵ {specs.length}ft</span>
                  <span>👥 {specs.guests || specs.cabins} guests</span>
                </>
              )}
            </div>
            
            {/* Similar Listings Preview - Compact */}
            <button
              onClick={handleSimilarListings}
              className="w-full bg-gray-800/30 backdrop-blur-sm rounded-lg p-2.5 mt-3 border border-gray-600/20 hover:bg-gray-700/40 transition-colors"
              data-testid="similar-listings-button"
            >
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-light">View Similar Listings</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowContextMenu(false)}
              data-testid="context-menu-overlay"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-6 z-50"
              data-testid="context-menu"
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    handleShare();
                    setShowContextMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  data-testid="menu-share"
                >
                  <Share className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Share Listing</span>
                </button>
                
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    toast({
                      title: "Reported",
                      description: "Thank you for keeping our community safe",
                      duration: 3000,
                    });
                    setShowContextMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  data-testid="menu-report"
                >
                  <Flag className="w-5 h-5 text-red-400" />
                  <span className="text-white font-medium">Report Listing</span>
                </button>
                
                <button
                  onClick={() => {
                    handleSave();
                    setShowContextMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  data-testid="menu-save-board"
                >
                  <Bookmark className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">Save to Board</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Comments Overlay */}
      <AnimatePresence>
        {showCommentsOverlay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowCommentsOverlay(false)}
              data-testid="comments-overlay"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-6 z-50 max-h-[70vh] overflow-y-auto"
              data-testid="comments-panel"
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Comments</h3>
                  <span className="text-gray-400 text-sm">{mockComments.length} comments</span>
                </div>
                
                {mockComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-xl bg-gray-800/30">
                    <img
                      src={comment.avatar}
                      alt={comment.user}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{comment.user}</span>
                        <span className="text-gray-400 text-xs">{comment.time}</span>
                      </div>
                      <p className="text-gray-200 text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                  <img
                    src={user?.name ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" : ""}
                    alt="You"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Preview Overlay */}
      <AnimatePresence>
        {showProfilePreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowProfilePreview(false)}
              data-testid="profile-overlay"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-6 z-50"
              data-testid="profile-panel"
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={mockSeller.avatar}
                      alt={mockSeller.name}
                      className="w-16 h-16 rounded-full border-2 border-white/20"
                    />
                    {mockSeller.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{mockSeller.name}</h3>
                    <p className="text-gray-300 text-sm">{mockSeller.listingsCount} active listings</p>
                    <p className="text-green-400 text-sm">{mockSeller.isOnline ? "Online now" : `Last seen ${mockSeller.lastSeen}`}</p>
                  </div>
                </div>
                
                <p className="text-gray-200 text-sm leading-relaxed">{mockSeller.bio}</p>
                
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                    Message Seller
                  </button>
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors">
                    View All Listings
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 360° Photo Viewer */}
      <AnimatePresence>
        {show360Viewer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
              onClick={() => setShow360Viewer(false)}
              data-testid="360-viewer-overlay"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed inset-4 bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 z-50 flex flex-col"
              data-testid="360-viewer-panel"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  360° Photo Viewer
                </h3>
                <button
                  onClick={() => setShow360Viewer(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-black">
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {listing.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-x-4 bottom-16 text-center">
                  <p className="text-white text-sm opacity-80">Swipe or tap to explore all angles</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Price History Chart */}
      <AnimatePresence>
        {showPriceHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowPriceHistory(false)}
              data-testid="price-history-overlay"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-6 z-50"
              data-testid="price-history-panel"
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Price History
                  </h3>
                  <span className="text-green-400 text-sm">↓ ${(mockPriceHistory[0].price - listing.price).toLocaleString()} saved</span>
                </div>
                
                {/* Simple price chart */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {mockPriceHistory.map((point, index) => {
                      const height = ((point.price - Math.min(...mockPriceHistory.map(p => p.price))) / 
                                    (Math.max(...mockPriceHistory.map(p => p.price)) - Math.min(...mockPriceHistory.map(p => p.price)))) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-xs text-gray-300">${point.price.toLocaleString()}</div>
                          <div 
                            className="w-full bg-blue-500 rounded-t-sm transition-all"
                            style={{ height: `${Math.max(height, 10)}%` }}
                          />
                          <div className="text-xs text-gray-400">{point.date}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-300 text-sm">This listing has dropped in price over the past month</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Similar Listings Carousel */}
      <AnimatePresence>
        {showSimilarListings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowSimilarListings(false)}
              data-testid="similar-listings-overlay"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-6 z-50 max-h-[60vh] overflow-y-auto"
              data-testid="similar-listings-panel"
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              <div className="space-y-6">
                <h3 className="text-white font-semibold text-lg">Similar Listings</h3>
                
                <div className="space-y-4">
                  {mockSimilarListings.map((similar) => (
                    <div key={similar.id} className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                      <img
                        src={similar.image}
                        alt={similar.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm mb-1">{similar.title}</h4>
                        <p className="text-gray-300 text-sm">${similar.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">📍 Similar location</span>
                          <span className="text-xs text-green-400">• Available</span>
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-white text-xs font-medium">
                        View
                      </button>
                    </div>
                  ))}
                </div>
                
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors">
                  Show All Similar Listings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Board Selector */}
      <AnimatePresence>
        {showBoardSelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowBoardSelector(false)}
              data-testid="board-selector-overlay"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-6 z-50"
              data-testid="board-selector-panel"
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              <div className="space-y-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Save to Board
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {mockBoards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => {
                        setSaved(true);
                        triggerHaptic('light');
                        toast({
                          title: "Saved!",
                          description: `Added to ${board.name}`,
                          duration: 2000,
                        });
                        setShowBoardSelector(false);
                      }}
                      className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-600/30 transition-colors"
                    >
                      <div className="text-2xl mb-2">{board.icon}</div>
                      <div className="text-white font-medium text-sm mb-1">{board.name}</div>
                      <div className="text-gray-400 text-xs">{board.count} items</div>
                    </button>
                  ))}
                </div>
                
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors border border-gray-600/30">
                  + Create New Board
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}