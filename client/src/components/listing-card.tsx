import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToggleLike } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { ListingWithUser } from "@shared/schema";

interface ListingCardProps {
  listing: ListingWithUser;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const toggleLikeMutation = useToggleLike();

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    toggleLikeMutation.mutate({
      userId: user.id,
      listingId: listing.id,
    });
  };

  const handleCardClick = () => {
    setLocation(`/listing/${listing.id}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  return (
    <div className="bg-white mb-4">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {listing.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <p className="font-semibold text-instagram-gray text-sm">
              {listing.user.name}
            </p>
            <p className="text-instagram-light-gray text-xs">{listing.location}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-instagram-light-gray">
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Image */}
      <img
        src={listing.images[0]}
        alt={listing.title}
        className="w-full h-80 object-cover cursor-pointer"
        onClick={handleCardClick}
      />

      {/* Actions and Content */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleLike}
              disabled={toggleLikeMutation.isPending}
              className="heart-animation p-0 h-auto"
            >
              <Heart
                size={24}
                className={
                  listing.isLiked
                    ? "text-instagram-red fill-instagram-red"
                    : "text-instagram-gray hover:text-instagram-red"
                }
              />
            </Button>
            <Button variant="ghost" size="icon" className="text-instagram-gray p-0 h-auto">
              <MessageCircle size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="text-instagram-gray p-0 h-auto">
              <Send size={24} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="text-instagram-gray p-0 h-auto">
            <Bookmark size={24} />
          </Button>
        </div>

        <p className="font-semibold text-instagram-gray mb-1">
          {listing.likesCount} likes
        </p>

        <div className="mb-2">
          <span className="font-semibold text-instagram-gray text-lg">
            {listing.title}
          </span>
          <span className="text-success-green font-bold text-lg ml-2">
            ${listing.price.toLocaleString()}
          </span>
        </div>

        <p className="text-instagram-gray text-sm">
          {listing.description.length > 100
            ? `${listing.description.slice(0, 100)}...`
            : listing.description}
          {listing.description.length > 100 && (
            <button
              onClick={handleCardClick}
              className="text-instagram-light-gray cursor-pointer ml-1"
            >
              more
            </button>
          )}
        </p>

        <p className="text-instagram-light-gray text-xs mt-2">
          {formatTimeAgo(new Date(listing.createdAt!))}
        </p>
      </div>
    </div>
  );
}
