import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, MessageCircle, MapPin, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingWithUser } from "@shared/schema";

interface TinderCardProps {
  listing: ListingWithUser;
  onLike: () => void;
  onPass: () => void;
  onMessage: () => void;
  isLiked: boolean;
}

export function TinderCard({ listing, onLike, onPass, onMessage, isLiked }: TinderCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - like
      setExitX(200);
      onLike();
    } else if (info.offset.x < -threshold) {
      // Swiped left - pass
      setExitX(-200);
      onPass();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLocationText = () => {
    if (listing.zipCode) return listing.zipCode;
    return "Location not specified";
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      initial={false}
    >
      {/* Image */}
      <div className="relative h-2/3 bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/80 text-white text-lg font-bold px-3 py-1">
            {formatPrice(listing.price)}
          </Badge>
        </div>

        {/* Verified Badge */}
        {listing.user.isVerified && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-blue-600 text-white">
              <Shield size={12} className="mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Swipe Indicators */}
        <motion.div
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
          style={{ opacity: useTransform(x, [-200, -50], [1, 0]) }}
        >
          <span className="text-red-600 text-6xl font-bold rotate-12">PASS</span>
        </motion.div>
        
        <motion.div
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
          style={{ opacity: useTransform(x, [50, 200], [0, 1]) }}
        >
          <span className="text-green-600 text-6xl font-bold -rotate-12">LIKE</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 h-1/3 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
            {listing.title}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin size={14} className="mr-1" />
            <span>{getLocationText()}</span>
            {listing.specs && typeof listing.specs === 'object' && 'year' in listing.specs && (
              <>
                <Calendar size={14} className="ml-3 mr-1" />
                <span>{listing.specs.year}</span>
              </>
            )}
          </div>

          {listing.description && (
            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
              {listing.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPass}
            className="rounded-full w-12 h-12 p-0"
          >
            ✕
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onMessage}
            className="rounded-full w-12 h-12 p-0"
          >
            <MessageCircle size={20} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLike}
            className={`rounded-full w-12 h-12 p-0 ${
              isLiked ? "bg-red-50 border-red-200" : ""
            }`}
          >
            <Heart 
              size={20} 
              className={isLiked ? "fill-red-500 text-red-500" : ""} 
            />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}