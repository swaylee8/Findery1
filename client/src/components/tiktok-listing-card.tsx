import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Play, Pause, Volume2, VolumeX, MapPin, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToggleLike } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import type { ListingWithUser } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface TikTokListingCardProps {
  listing: ListingWithUser;
  isActive: boolean;
  onRefresh: () => void;
}

export default function TikTokListingCard({ listing, isActive, onRefresh }: TikTokListingCardProps) {
  const { user } = useAuth();
  const toggleLikeMutation = useToggleLike();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Auto-play video when active
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (isActive && listing.videoUrl) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setVideoError(true);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, listing.videoUrl, videoError]);

  const handleToggleLike = () => {
    if (!user) return;
    
    setIsLiked(!isLiked);
    toggleLikeMutation.mutate({
      userId: user.id,
      listingId: listing.id,
    });
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getLocationText = () => {
    if (listing.zipCode) {
      return listing.zipCode;
    }
    return listing.location;
  };

  const getCategorySpecs = () => {
    if (!listing.specs) return null;
    
    try {
      const specs = typeof listing.specs === 'string' ? JSON.parse(listing.specs) : listing.specs;
      
      if (listing.category === 'homes') {
        return `${specs.bedrooms || 0} bed • ${specs.bathrooms || 0} bath`;
      } else if (listing.category === 'cars') {
        return `${specs.mileage || 0} miles • ${specs.year || 'N/A'}`;
      } else if (listing.category === 'boats') {
        return `${specs.length || 0}ft • ${specs.year || 'N/A'}`;
      }
    } catch (e) {
      return null;
    }
    
    return null;
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Media Content */}
      <div className="absolute inset-0" onClick={handleVideoClick}>
        {listing.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={listing.videoUrl}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onError={() => setVideoError(true)}
            data-testid={`video-${listing.id}`}
          />
        ) : listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
            data-testid={`image-${listing.id}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <p>No media available</p>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        {listing.videoUrl && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {!isPlaying && (
              <div className="bg-black/50 rounded-full p-4">
                <Play size={32} className="text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6 z-20">
        <motion.div
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full backdrop-blur-sm ${
              isLiked ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            onClick={handleToggleLike}
            data-testid={`button-like-${listing.id}`}
          >
            <Heart size={24} fill={isLiked ? 'white' : 'none'} />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">12.3K</span>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            data-testid={`button-message-${listing.id}`}
          >
            <MessageCircle size={24} />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">234</span>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            data-testid={`button-share-${listing.id}`}
          >
            <Share size={24} />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">45</span>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
          data-testid={`button-more-${listing.id}`}
        >
          <MoreHorizontal size={24} />
        </Button>
      </div>

      {/* Video Controls */}
      {listing.videoUrl && !videoError && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            onClick={toggleMute}
            data-testid={`button-mute-${listing.id}`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      )}

      {/* Bottom Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pb-24">
        {/* User Info */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">
              {listing.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">@{listing.user.name}</p>
            <p className="text-gray-300 text-xs">{getLocationText()}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">{listing.title}</h2>
            <div className="text-3xl font-bold text-white mb-2">
              {formatPrice(listing.price)}
            </div>
          </div>

          {/* Key Specs */}
          {getCategorySpecs() && (
            <div className="flex items-center text-gray-300 text-sm">
              <span>{getCategorySpecs()}</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white backdrop-blur-sm border-0 capitalize"
            >
              {listing.category}
            </Badge>
          </div>

          {/* More Details Button */}
          <motion.div
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              onClick={() => setShowDetails(!showDetails)}
              data-testid={`button-details-${listing.id}`}
            >
              <Info size={16} className="mr-2" />
              {showDetails ? 'Less Details' : 'More Details'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Expanded Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 bg-black/95 backdrop-blur-xl rounded-t-3xl p-6 z-30 max-h-96 overflow-y-auto"
            data-testid={`details-modal-${listing.id}`}
          >
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6"></div>
            
            <div className="text-white space-y-4">
              <h3 className="text-xl font-bold">{listing.title}</h3>
              <p className="text-gray-300 leading-relaxed">{listing.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <p className="text-white capitalize">{listing.category}</p>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <p className="text-white">{listing.location}</p>
                </div>
                <div>
                  <span className="text-gray-400">Price:</span>
                  <p className="text-white">${listing.price.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Listed:</span>
                  <p className="text-white">2 hours ago</p>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                data-testid={`button-contact-${listing.id}`}
              >
                Contact Seller
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}