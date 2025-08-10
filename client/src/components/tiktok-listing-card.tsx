import { useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Flag, Eye } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useHaptics } from "@/hooks/use-haptics";
import { useSound } from "@/hooks/use-sound";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@shared/schema";

interface TikTokListingCardProps {
  listing: Listing;
  isActive: boolean;
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

export default function TikTokListingCard({ listing, isActive }: TikTokListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isLongPress, setIsLongPress] = useState(false);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { triggerHaptic } = useHaptics();
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

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
      // Double tap detected
      setLiked(true);
      setShowHeartAnimation(true);
      triggerHaptic('medium');
      playSound('like');
      likeMutation.mutate();
      
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    
    setLastTap(now);
  }, [lastTap, triggerHaptic, playSound, likeMutation]);

  const handleLongPressStart = useCallback(() => {
    setIsLongPress(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      setShowContextMenu(true);
      triggerHaptic('heavy');
      playSound('pop');
    }, 500);
  }, [triggerHaptic, playSound]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handlePanEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right - save/favorite
      setSaved(true);
      triggerHaptic('selection');
      playSound('swipe');
      saveMutation.mutate();
      toast({
        title: "Saved!",
        description: "Added to your favorites",
        duration: 2000,
      });
    } else if (info.offset.x < -threshold) {
      // Swipe left - not interested
      triggerHaptic('light');
      playSound('swipe');
      toast({
        title: "Not interested",
        description: "We'll show you less like this",
        duration: 2000,
      });
    }
    
    // Reset position
    x.set(0);
  }, [x, triggerHaptic, playSound, saveMutation, toast]);

  const handleLike = useCallback(() => {
    setLiked(!liked);
    triggerHaptic('light');
    playSound('like');
    likeMutation.mutate();
  }, [liked, triggerHaptic, playSound, likeMutation]);

  const handleSave = useCallback(() => {
    setSaved(!saved);
    triggerHaptic('light');
    playSound('pop');
    saveMutation.mutate();
  }, [saved, triggerHaptic, playSound, saveMutation]);

  const handleShare = useCallback(() => {
    triggerHaptic('light');
    playSound('notification');
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this ${listing.category.slice(0, -1)}: ${listing.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this listing with others",
      });
    }
  }, [listing, triggerHaptic, playSound, toast]);

  const specs = typeof listing.specs === 'string' ? JSON.parse(listing.specs) : listing.specs;

  return (
    <>
      <motion.div
        ref={cardRef}
        data-testid={`listing-card-${listing.id}`}
        className="relative h-screen w-full overflow-hidden snap-start snap-always"
        style={{ x, opacity, scale }}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onPanEnd={handlePanEnd}
        onPointerDown={handleLongPressStart}
        onPointerUp={handleLongPressEnd}
        onPointerLeave={handleLongPressEnd}
        onClick={handleDoubleTap}
      >
        {/* Background Image/Video */}
        <div className="absolute inset-0">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-full w-full object-cover"
            loading={isActive ? "eager" : "lazy"}
            data-testid={`listing-image-${listing.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Double-tap Heart Animation */}
        <AnimatePresence>
          {showHeartAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              data-testid="heart-animation"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 pointer-events-none z-20"
          animate={{
            opacity: useTransform(x, [0, 50, 150], [0, 0.5, 1]).get(),
            x: useTransform(x, [0, 150], [0, 50]).get()
          }}
          data-testid="swipe-right-indicator"
        >
          <Bookmark className="w-8 h-8 text-green-400 mb-2" />
          <span className="text-green-400 font-semibold text-sm">Save</span>
        </motion.div>

        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 pointer-events-none z-20"
          animate={{
            opacity: useTransform(x, [-150, -50, 0], [1, 0.5, 0]).get(),
            x: useTransform(x, [-150, 0], [-50, 0]).get()
          }}
          data-testid="swipe-left-indicator"
        >
          <Eye className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-gray-400 font-semibold text-sm">Pass</span>
        </motion.div>

        {/* Right Action Bar */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20">
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
            data-testid={`button-like-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 group-active:scale-95 transition-transform">
              <Heart 
                className={`w-7 h-7 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} 
              />
            </div>
            <span className="text-white text-xs font-medium">12.3K</span>
          </button>

          <button
            onClick={() => {}}
            className="flex flex-col items-center gap-1 group"
            data-testid={`button-message-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 group-active:scale-95 transition-transform">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xs font-medium">234</span>
          </button>

          <button
            onClick={handleSave}
            className="flex flex-col items-center gap-1 group"
            data-testid={`button-save-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 group-active:scale-95 transition-transform">
              <Bookmark 
                className={`w-7 h-7 ${saved ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`} 
              />
            </div>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group"
            data-testid={`button-share-${listing.id}`}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 group-active:scale-95 transition-transform">
              <Share className="w-7 h-7 text-white" />
            </div>
          </button>
        </div>

        {/* Bottom Info Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white max-w-[70%]">
                {listing.title}
              </h2>
              <div className="text-3xl font-bold text-white">
                {formatPrice(listing.price)}
              </div>
            </div>
            
            <p className="text-gray-200 text-sm leading-relaxed max-w-[80%]">
              {listing.description}
            </p>
            
            <div className="flex items-center gap-4 text-gray-300 text-sm">
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
          </div>
        </div>
      </motion.div>

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
                    playSound('notification');
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
    </>
  );
}