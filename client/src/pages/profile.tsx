import { useState } from "react";
import { Heart, Grid, LogOut, Shield, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useUserListings, useLikedListings } from "@/hooks/use-listings";
import { useHaptics } from "@/hooks/use-haptics";
import { useSound } from "@/hooks/use-sound";
import { useLocation } from "wouter";
import VerificationModal from "@/components/verification-modal";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"liked" | "posted">("liked");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { user, logout } = useAuth();
  const { triggerHaptic } = useHaptics();
  const { playSound } = useSound();
  const [, setLocation] = useLocation();

  const { data: likedListings } = useLikedListings(user?.id || 0);
  const { data: userListings } = useUserListings(user?.id || 0);

  const handleTabChange = (tab: "liked" | "posted") => {
    setActiveTab(tab);
    triggerHaptic('light');
    playSound('pop');
  };

  const handleLogout = () => {
    triggerHaptic('medium');
    playSound('notification');
    logout();
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header with glassmorphism */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </Button>
          
          <h1 className="text-xl font-light text-white tracking-wide">Profile</h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
            data-testid="button-logout"
          >
            <LogOut size={24} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-6 h-full overflow-y-auto scrollbar-hide">
        {/* Profile Header - Glassmorphism Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-gray-700/50 flex items-center justify-center">
                <span className="text-white text-2xl font-light tracking-wider">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              
              {/* Online Status - Minimal green dot */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500/90 rounded-full border-2 border-black backdrop-blur-sm" />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-light text-white tracking-wide">{user.name}</h2>
                {user.isVerified && (
                  <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-2 py-1 flex items-center space-x-1">
                    <Shield size={12} className="text-blue-300" />
                    <span className="text-xs text-blue-300 font-light">Verified</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 font-light tracking-wide">{user.email}</p>
              
              {/* Bio - Understated */}
              <p className="text-gray-300 font-light leading-relaxed max-w-sm">
                Marketplace enthusiast • Looking for unique finds • Based in San Francisco
              </p>
            </div>
          </div>

          {/* Stats - Floating subtle overlays */}
          <div className="flex space-x-8 mt-8">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl px-4 py-3">
              <div className="text-2xl font-light text-white">{userListings?.length || 0}</div>
              <div className="text-sm text-gray-400 font-light">Listings</div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl px-4 py-3">
              <div className="text-2xl font-light text-white">{likedListings?.length || 0}</div>
              <div className="text-sm text-gray-400 font-light">Likes</div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl px-4 py-3">
              <div className="text-2xl font-light text-white">4.9</div>
              <div className="text-sm text-gray-400 font-light">Rating</div>
            </div>
          </div>

          {/* Get Verified Button */}
          {!user.isVerified && (
            <Button
              onClick={() => setShowVerificationModal(true)}
              className="mt-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl px-6 py-3 font-light tracking-wide"
              data-testid="button-get-verified"
            >
              <Shield size={16} className="mr-2" />
              Get Verified
            </Button>
          )}
        </motion.div>

        {/* Tab Navigation - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-2 mb-8"
        >
          <div className="flex">
            <Button
              variant="ghost"
              onClick={() => handleTabChange("liked")}
              className={`flex-1 py-4 rounded-2xl font-light tracking-wide transition-all duration-300 ${
                activeTab === "liked"
                  ? "bg-white/10 text-white backdrop-blur-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              data-testid="tab-liked"
            >
              <Heart size={18} className="mr-2" />
              Liked
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabChange("posted")}
              className={`flex-1 py-4 rounded-2xl font-light tracking-wide transition-all duration-300 ${
                activeTab === "posted"
                  ? "bg-white/10 text-white backdrop-blur-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              data-testid="tab-posted"
            >
              <Grid size={18} className="mr-2" />
              Posted
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
            className="grid grid-cols-2 gap-4"
          >
            {activeTab === "liked" ? (
              likedListings?.length ? (
                likedListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="aspect-square bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden group hover:bg-black/60 transition-all duration-300"
                    data-testid={`liked-listing-${listing.id}`}
                  >
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-light text-sm truncate">{listing.title}</p>
                        <p className="text-gray-300 font-light text-xs">${listing.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-16 bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl">
                  <Heart className="text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400 font-light">No liked listings yet</p>
                  <p className="text-gray-500 font-light text-sm mt-2">Start exploring to find items you love</p>
                </div>
              )
            ) : userListings?.length ? (
              userListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="aspect-square bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden group hover:bg-black/60 transition-all duration-300"
                  data-testid={`user-listing-${listing.id}`}
                >
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-light text-sm truncate">{listing.title}</p>
                      <p className="text-gray-300 font-light text-xs">${listing.price.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl">
                <Grid className="text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 font-light">No listings posted yet</p>
                <Button
                  onClick={() => setLocation('/add-listing')}
                  className="mt-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl px-6 py-2 font-light tracking-wide"
                  data-testid="button-add-first-listing"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Listing
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
      />
    </div>
  );
}