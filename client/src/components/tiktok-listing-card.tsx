import { useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Flag, Eye, User, ExternalLink, Circle, Users } from "lucide-react";
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
      // Double tap detected - toggle like state
      const newLikedState = !liked;
      setLiked(newLikedState);
      setShowHeartAnimation(true);
      triggerHaptic('medium');
      
      if (newLikedState) {
        playSound('like');
      } else {
        playSound('pop'); // Different sound for unlike
      }
      
      onInteraction?.('like');
      likeMutation.mutate();
      
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    
    setLastTap(now);
  }, [lastTap, liked, triggerHaptic, playSound, onInteraction, likeMutation]);

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
      onInteraction?.('skip');
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
    onInteraction?.('like');
    likeMutation.mutate();
  }, [liked, triggerHaptic, playSound, onInteraction, likeMutation]);

  const handleSave = useCallback(() => {
    setSaved(!saved);
    triggerHaptic('light');
    playSound('pop');
    onInteraction?.('save');
    saveMutation.mutate();
  }, [saved, triggerHaptic, playSound, onInteraction, saveMutation]);

  const handleShare = useCallback(() => {
    triggerHaptic('light');
    playSound('notification');
    onInteraction?.('share');
    
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.category.slice(0, -1)}: ${listing.title} - ${formatPrice(listing.price)}`,
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
  }, [listing, triggerHaptic, playSound, onInteraction, toast]);

  const handleCommentsOpen = useCallback(() => {
    triggerHaptic('light');
    playSound('pop');
    setShowCommentsOverlay(true);
  }, [triggerHaptic, playSound]);

  const handleProfilePreview = useCallback(() => {
    triggerHaptic('light');
    playSound('pop');
    setShowProfilePreview(true);
  }, [triggerHaptic, playSound]);

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
            loading={shouldLoadEagerly ? "eager" : "lazy"}
            style={{
              filter: isImagePreloaded ? 'none' : 'blur(5px)',
              transition: 'filter 0.3s ease'
            }}
            data-testid={`listing-image-${listing.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
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
            onClick={handleCommentsOpen}
            className="flex flex-col items-center gap-1 group"
            data-testid={`button-comments-${listing.id}`}
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
            {/* Seller Profile Section */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <button
                  onClick={handleProfilePreview}
                  className="relative"
                  data-testid={`seller-avatar-${listing.id}`}
                >
                  <img
                    src={mockSeller.avatar}
                    alt="Seller"
                    className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors"
                  />
                  {/* Online Status Indicator */}
                  {mockSeller.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    </div>
                  )}
                </button>
              </div>
              <div className="flex-1">
                <button
                  onClick={handleProfilePreview}
                  className="text-left hover:opacity-80 transition-opacity"
                >
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    {mockSeller.name}
                    {mockSeller.isOnline && (
                      <span className="text-green-400 text-xs">• Online</span>
                    )}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {mockSeller.listingsCount} listings • {mockSeller.isOnline ? "Active now" : `Last seen ${mockSeller.lastSeen}`}
                  </p>
                </button>
              </div>
              {/* Message Button */}
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-white text-sm font-medium transition-colors">
                Message
              </button>
            </div>

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
    </>
  );
}