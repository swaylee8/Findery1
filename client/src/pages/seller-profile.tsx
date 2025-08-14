import { useState } from "react";
import { Heart, Grid, MessageCircle, Shield, ArrowLeft, Star, MapPin, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/use-haptics";

import { useLocation } from "wouter";

export default function SellerProfile(props: { params: { sellerId: string } }) {
  const sellerId = props.params.sellerId;
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");
  const { triggerHaptic } = useHaptics();

  const [, setLocation] = useLocation();

  // Mock seller data - this would come from API in real app
  const mockSeller = {
    id: sellerId || "2",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b05c?w=150",
    isVerified: true,
    isOnline: true,
    lastSeen: "2 hours ago",
    rating: 4.8,
    totalReviews: 127,
    totalListings: 18,
    totalSales: 45,
    joinDate: "March 2023",
    location: "San Francisco, CA",
    bio: "Passionate collector of vintage items and modern tech. I love finding unique pieces and sharing them with fellow enthusiasts.",
    responseTime: "Usually responds within 2 hours",
    badges: ["Top Seller", "Fast Responder", "Verified Profile"],
  };

  // Mock listings - this would come from API
  const mockListings = [
    {
      id: 1,
      title: "Vintage 1970s Leather Jacket",
      price: 285,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      likes: 24,
      isLiked: false,
    },
    {
      id: 2,
      title: "Mid-Century Modern Chair",
      price: 450,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      likes: 18,
      isLiked: true,
    },
    {
      id: 3,
      title: "Vintage Film Camera",
      price: 125,
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400",
      likes: 31,
      isLiked: false,
    },
    {
      id: 4,
      title: "Handmade Ceramic Vase",
      price: 65,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      likes: 12,
      isLiked: false,
    },
  ];

  const handleTabChange = (tab: "listings" | "reviews") => {
    setActiveTab(tab);
    triggerHaptic('light');
  };

  const handleMessageSeller = () => {
    triggerHaptic('medium');
    // Navigate to messages with this seller pre-selected
    setLocation(`/messages?seller=${mockSeller.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header with glassmorphism */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-gray-800/50">
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="text-white/80 hover:text-white hover:bg-white/10"
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </Button>
          
          <h1 className="text-xl font-light text-white tracking-wide">Seller Profile</h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-6 h-full overflow-y-auto scrollbar-hide">
        {/* Profile Header - Glassmorphism Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/50 border border-gray-800/50 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full border border-gray-700/50 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
                <img
                  src={mockSeller.avatar}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                  aria-hidden="true"
                />
                <img
                  src={mockSeller.avatar}
                  alt={mockSeller.name}
                  className="relative w-full h-full object-cover"
                />
              </div>
              
              {/* Online Status - Minimal green dot */}
              {mockSeller.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500/90 rounded-full border-2 border-black backdrop-blur-sm" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-light text-white tracking-wide">{mockSeller.name}</h2>
                {mockSeller.isVerified && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 flex items-center space-x-1">
                    <Shield size={12} className="text-blue-300" />
                    <span className="text-xs text-blue-300 font-light">Verified</span>
                  </div>
                )}
              </div>
              
              {/* Location and Rating */}
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span className="text-sm font-light">{mockSeller.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-light">{mockSeller.rating} ({mockSeller.totalReviews} reviews)</span>
                </div>
              </div>
              
              {/* Bio */}
              <p className="text-gray-300 font-light leading-relaxed max-w-sm">
                {mockSeller.bio}
              </p>

              {/* Response Time */}
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock size={14} />
                <span className="text-sm font-light">{mockSeller.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Stats - Floating subtle overlays */}
          <div className="flex space-x-8 mt-8">
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-2xl px-4 py-3">
              <div className="text-2xl font-light text-white">{mockSeller.totalListings}</div>
              <div className="text-sm text-gray-400 font-light">Listings</div>
            </div>
            
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-2xl px-4 py-3">
              <div className="text-2xl font-light text-white">{mockSeller.totalSales}</div>
              <div className="text-sm text-gray-400 font-light">Sales</div>
            </div>
            
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-2xl px-4 py-3">
              <div className="text-2xl font-light text-white">{mockSeller.rating}</div>
              <div className="text-sm text-gray-400 font-light">Rating</div>
            </div>
          </div>

          {/* Message Seller Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleMessageSeller}
              className="bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 rounded-2xl px-8 py-4 font-light tracking-wide text-lg"
              data-testid="button-message-seller"
            >
              <MessageCircle size={20} className="mr-3" />
              Message Seller
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-6">
            {mockSeller.badges.map((badge) => (
              <div
                key={badge}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-3 py-1"
              >
                <span className="text-xs text-purple-300 font-light">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tab Navigation - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/50 border border-gray-800/50 rounded-2xl p-2 mb-8"
        >
          <div className="flex space-x-2">
            <Button
              onClick={() => handleTabChange("listings")}
              variant={activeTab === "listings" ? "default" : "ghost"}
              className={`flex-1 rounded-xl font-light tracking-wide ${
                activeTab === "listings"
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid="tab-listings"
            >
              <Grid size={16} className="mr-2" />
              Listings
            </Button>
            <Button
              onClick={() => handleTabChange("reviews")}
              variant={activeTab === "reviews" ? "default" : "ghost"}
              className={`flex-1 rounded-xl font-light tracking-wide ${
                activeTab === "reviews"
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid="tab-reviews"
            >
              <Star size={16} className="mr-2" />
              Reviews
            </Button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "listings" ? (
              <div className="grid grid-cols-2 gap-4">
                {mockListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="aspect-square bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden group hover:bg-black/60 transition-all duration-300"
                    data-testid={`seller-listing-${listing.id}`}
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={listing.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
                        aria-hidden="true"
                      />
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-light text-sm truncate">{listing.title}</p>
                        <p className="text-gray-300 font-light text-xs">${listing.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mock Reviews */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-gray-700/50"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-white font-light">Anonymous User</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 font-light text-sm">
                          Great seller! Fast shipping and exactly as described. Would definitely buy again.
                        </p>
                        <p className="text-gray-500 font-light text-xs mt-2">2 weeks ago</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}