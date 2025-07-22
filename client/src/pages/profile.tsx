import { useState } from "react";
import { Heart, Grid, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useUserListings, useLikedListings } from "@/hooks/use-listings";
import BottomNav from "@/components/bottom-nav";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"liked" | "posted">("liked");
  const { user, logout } = useAuth();

  const { data: likedListings } = useLikedListings(user?.id || 0);
  const { data: userListings } = useUserListings(user?.id || 0);

  if (!user) return null;

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-instagram-gray text-center flex-1">Profile</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-instagram-light-gray"
        >
          <LogOut size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* User Info */}
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-instagram-gray text-lg">{user.name}</h3>
              <p className="text-instagram-light-gray">{user.email}</p>
              <div className="flex space-x-4 mt-2">
                <span className="text-sm">
                  <span className="font-semibold">{userListings?.length || 0}</span> listings
                </span>
                <span className="text-sm">
                  <span className="font-semibold">{likedListings?.length || 0}</span> likes
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("liked")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "liked"
                  ? "text-instagram-blue border-b-2 border-instagram-blue"
                  : "text-instagram-light-gray"
              }`}
            >
              <Heart size={16} className="mr-2" />
              Liked
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("posted")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "posted"
                  ? "text-instagram-blue border-b-2 border-instagram-blue"
                  : "text-instagram-light-gray"
              }`}
            >
              <Grid size={16} className="mr-2" />
              Posted
            </Button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-2 gap-3">
            {activeTab === "liked" ? (
              likedListings?.length ? (
                likedListings.map((listing) => (
                  <div key={listing.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Heart className="mx-auto text-gray-300 mb-2" size={48} />
                  <p className="text-instagram-light-gray">No liked listings yet</p>
                </div>
              )
            ) : userListings?.length ? (
              userListings.map((listing) => (
                <div key={listing.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Grid className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-instagram-light-gray">No listings posted yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
